require('dotenv').config()
const _ = require('underscore');
const mongo = require('./src/mongodb/mongo');
const todo = require('./src/todo');
const sawtoothHelper = require('./src/sawtooth/sawtooth-helpers');
const crypto = require('crypto');
const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');


const blockCollectionPromise = mongo.client().then((client) => {
  return client.db('mydb').collection('block');
});

const TODO_PREFIX = todo.SAWTOOTH_PREFIX;
const AUTH_PREFIX = hash512("auth").substring(0, 6);

const {
  EventFilter,  
} = require('sawtooth-sdk/protobuf');

/*
'sawtooth/state-delta' must be used with 'sawtooth/block-commit'
*/
const handlers = [
  {
    eventType: 'sawtooth/state-delta',
    filters: [{
      key: 'address',
      matchString: `^${TODO_PREFIX}.*`,
      filterType: EventFilter.FilterType.REGEX_ANY
    }],
    handle: null,
  },
  // {
  //   eventType: 'sawtooth/state-delta',
  //   filters: [{
  //     key: 'address',
  //     matchString: `^${AUTH_PREFIX}.*`,
  //     filterType: EventFilter.FilterType.REGEX_ANY
  //   }],
  //   handle: null,
  // },
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
  
  const blockCollection = await blockCollectionPromise;

  if(!blockByNum || blockByNum.block_id === block.block_id ){ //No fork
    await todo.addState(block, events);
    await todo.addTransactions(block);
    await blockCollection.updateOne({_id: block.block_id},{$set:{_id: block.block_id, ...block}}, {upsert: true});

  }
  else{ // Fork
    console.log('FORK!!')
    //Remove invalid data
    await todo.removeDataAfterBlockNumInclusive(block.block_num);
    await removeBlocksAfterBlockNumInclusive(block.block_num);

    // await recalculateState();

    await todo.addState(block, events);
    await todo.addTransactions(block);
    await blockCollection.updateOne({_id: block.block_id},{$set:{_id: block.block_id, ...block}}, {upsert: true});

  }
}

async function findBlockByNum(block_num){
  const blockCollection = await blockCollectionPromise;
  return await blockCollection.findOne({block_num});
}

async function removeBlocksAfterBlockNumInclusive(block_num){
  const blockCollection = await blockCollectionPromise;
  await blockCollection.deleteMany({block_num: {$gte: block_num}});
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
