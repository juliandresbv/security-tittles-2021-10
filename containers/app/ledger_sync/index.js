require('dotenv').config()
const _ = require('underscore');
const mongo = require('./src/mongodb/mongo');

const blockCollectionPromise = mongo.client().then((client) => {
  return client.db('mydb').collection('block');
});

const transactionCollectionPromise = mongo.client().then((client) => {
  return client.db('mydb').collection('transaction');
});

const stateCollectionPromise = mongo.client().then((client) => {
  return client.db('mydb').collection('state');
});

const sawtoothHelper = require('./src/sawtooth/sawtooth-helpers');

const crypto = require('crypto');
const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');
const PREFIX = hash512("todos").substring(0, 6);

const {
  EventFilter,  
} = require('sawtooth-sdk/protobuf');
const { default: axios } = require('axios');

/*
'sawtooth/state-delta' must be used with 'sawtooth/block-commit'
*/
const handlers = [
  {
    eventType: 'sawtooth/state-delta',
    filters: [{
      key: 'address',
      matchString: `^${PREFIX}.*`,
      filterType: EventFilter.FilterType.REGEX_ANY
    }],
    handle: null,
  },
  {
    eventType: 'sawtooth/block-commit',
    filters: [],
    handle: blockCommitHandler
  },
  // {
  //   eventType: 'myevent',
  //   filters: [],
  //   handle: (e) => console.log(e) 
  // }
];

(async () => {

  let lastBlock = sawtoothHelper.NULL_BLOCK_ID;

  const blockCollection = await blockCollectionPromise;
  const cursor = await blockCollection.find({}).sort({block_num: -1}).limit(1);
  await new Promise((resolve, reject) => {
    cursor.forEach((doc)=>{
      lastBlock = doc.block_id
    }, 
    resolve)
  });

  sawtoothHelper.subscribeToSawtoothEvents(handlers, lastBlock);
})();


async function blockCommitHandler(block, events){
  // console.log(block);

  //https://github.com/hyperledger-archives/sawtooth-supply-chain/blob/master/ledger_sync/db/blocks.js
  // If the blockNum did not already exist, or had the same id
  // there is no fork, return the block
  
  let blockByNum = await findBlockByNum(block.block_num);
  
  if(!blockByNum || blockByNum.block_id === block.block_id ){ //No fork
    await addState(block, events);
    await addTransactions(block);
  }
  else{ // Fork
    console.log('FORK!!')
    //Remove invalid data
    await removeTransactionsAfterBlockNumInclusive(block.block_num);
    await removeStateAfterBlockNumInclusive(block.block_num);

    await addState(block, events);
    await addTransactions(block);
  }
}

async function findBlockByNum(block_num){
  const blockCollection = await blockCollectionPromise;
  return await blockCollection.findOne({block_num});
}


async function addTransactions(block){

  const blockCollection = await blockCollectionPromise;
  const txCollection = await transactionCollectionPromise;

  const tb = getTransactionsFromBlock(block);

  for(n = 0; n < tb.length; n++){
    const t = tb[n];
    let p = JSON.parse(t.payload);

    let t_new = _.clone(t);
    t_new._id = t_new.txid;

    if(p.input){
      let prev = await txCollection.findOne({_id: p.input});
      t_new.input = prev._id;
      t_new.root = prev.root;
      t_new.idx = prev.idx + 1;
    }
    else{
      t_new.input = null;
      t_new.root = t_new.txid;
      t_new.idx = 0;
    }
    await txCollection.updateOne({_id: t_new._id}, {$set: t_new}, {upsert: true});
    
  }

  await blockCollection.updateOne({_id: block.block_id},{$set:{_id: block.block_id, ...block}}, {upsert: true});

}

async function removeTransactionsAfterBlockNumInclusive(block_num){
  const blockCollection = await blockCollectionPromise;
  const txCollection = await transactionCollectionPromise;

  await blockCollection.deleteMany({block_num: {$gte: block_num}});
  await blockCollection.deleteMany({block_num: {$gte: block_num}});

}


async function removeStateAfterBlockNumInclusive(block_num){
  const stateCollection = await stateCollectionPromise;
  await stateCollection.deleteMany({block_num: {$gte: block_num}});

}


function getSawtoothTransactionsFromBlock(block) {
  return _.chain(block.batches)
    .map(b => {
      return _.map(b.transactions, t => {
        let payload;
        try {
          payload = JSON.parse(Buffer.from(t.payload, 'base64').toString('utf-8'));
        }
        catch (err) {
          payload = Buffer.from(t.payload, 'base64').toString('utf-8');
        }
        return {
          block_id: block.block_id,
          block_num: block.block_num,
          batch_id: b.header_signature,
          transaction_id: t.header_signature,
          payload: payload,
          family_name: t.header.family_name
        };
      });
    })
    .flatten()
    .filter(t => t.family_name === 'todos')
    // .indexBy(t => t.payload.args.txid)
    .value();
}


function getTransactionsFromBlock(block){
  const sawtoothT = getSawtoothTransactionsFromBlock(block);
  return _.map(sawtoothT, sawtoothTransactionToTransaction);
}


function sawtoothTransactionToTransaction(t){
  const payload = t.payload.args.transaction;
  const txid = t.payload.args.txid;
  return {
    payload,
    txid,

    block_id: t.block_id,
    block_num: t.block_num,
    batch_id: t.batch_id,
    transaction_id: t.transaction_id,
    // family_name: t.family_name
  };
}

async function getStateDeltas(block, events){
  const stateCollection = await stateCollectionPromise;

  let deltas = [];

  for(n = 0; n < events.length; n++){
    const e = events[n];
    const address = e.address;

    let prevState = {};
    const cursor = await stateCollection.find({address}).sort({block_num: -1}).limit(1);
    await new Promise((resolve, reject) => {
      cursor.forEach((doc)=>{
        prevState[doc.address] = doc;
      }, 
      resolve)
    });

    let toDelete = [];

    if(e.type == 'DELETE'){
      toDelete = _.keys(prevState);
    }
    else if(e.type == 'SET'){
      const p = JSON.parse(e.value.toString('utf-8'));
      let updates = {}
      for(m = 0; m < p.length; m++){
        const {key, value} = p[m];
        updates[key] = value;
  
        deltas.push({
          address,
          key,
          block_num: block.block_num,
          value,
          type: 'SET'
        });
      }
  
      toDelete = _.difference(_.keys(prevState), _.keys(updates));
      console.log(toDelete);
    }
    else{
      //
    }

    for(m = 0; m < toDelete.length; m ++){
      const k = toDelete[m];
      deltas.push({
        address,
        key:k,
        block_num: block.block_num,
        value: null,
        type: 'DELETE'
      });
    }

  }
  return deltas;
}


async function addState(block, events){

  const stateCollection = await stateCollectionPromise;

  const deltas = await getStateDeltas(block, events);

  for(n = 0; n < deltas.length; n++){
    const u = deltas[n];
    await stateCollection.updateOne({
        address: u.address, 
        key:u.key, 
        block_num: u.block_num
      }, 
      {$set: u}, 
      {upsert: true});
  }
}

//=============================================


let startshutdown = false;
async function shutdown(){
  if(startshutdown){
    return;
  }
  startshutdown = true;

  return new Promise((resolve, reject) => {
    let end = false;
    const finish = (err) => {
      if(!end){
        if(err){
          console.log(err.message);
          resolve();
        }
        console.log('shut down normally');
        resolve();
      }
      end = true;
    };

    (async () => {
      await mongo.close();
      await sawtoothHelper.close();
      finish();
    })();

    setTimeout(() => finish(new Error('Timeout')), 2000);
  });  
}

process.on('SIGINT', async () => {
  // await console.log('SIGINT')
  await shutdown();
  // process.kill(process.pid, 'SIGUSR2');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await shutdown();
  // process.kill(process.pid, 'SIGUSR2');
  process.exit(0);
});

process.once('SIGUSR2', async () => {
  await shutdown();
  console.log('kill');
  // process.kill(process.pid, 'SIGUSR2');
  process.exit(0);
});
