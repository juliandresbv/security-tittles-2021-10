const _ = require('underscore');
const crypto = require('crypto');
const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');
const SAWTOOTH_PREFIX = hash512("todos").substring(0, 6);

const mongo = require('./mongodb/mongo');


const transactionCollectionPromise = mongo.client().then((client) => {
  return client.db('mydb').collection('todo_transaction');
});

const stateCollectionPromise = mongo.client().then((client) => {
  return client.db('mydb').collection('todo_state');
});

const stateHistoryCollectionPromise = mongo.client().then((client) => {
  return client.db('mydb').collection('todo_state_history');
});


async function addState(block, events){

  const stateHistoryCollection = await stateHistoryCollectionPromise;

  const deltas = await getStateDeltas(block, events);

  for(let n = 0; n < deltas.length; n++){
    const d = deltas[n];
    await stateHistoryCollection.updateOne({
      address: d.address, 
      key:d.key, 
      block_num: d.block_num
    }, 
    {$set: d}, 
    {upsert: true});

    await applyDeltaToState(d);
  }

}

async function getStateDeltas(block, events){
  const stateHistoryCollection = await stateHistoryCollectionPromise;

  let deltas = [];

  for(let n = 0; n < events.length; n++){
    const e = events[n];
    const address = e.address;

    let prevState = {};
    const cursor = stateHistoryCollection.find({address}).sort({block_num: -1}).limit(1);
    await new Promise((resolve) => {
      cursor.forEach((doc)=>{
        prevState[doc.key] = doc;
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
      for(let m = 0; m < p.length; m++){
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
    }
    else{
      //
    }

    for(let m = 0; m < toDelete.length; m ++){
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

async function applyDeltaToState(delta){
  const stateCollection = await stateCollectionPromise;
  if(delta.type === 'SET'){
    await stateCollection.updateOne({_id: delta.key}, {$set: {
      _id: delta.key,
      address: delta.address,
      block_num: delta.block_num,
      value: delta.value 
    }}, {upsert: true});
  }
  else if(delta.type === 'DELETE'){
    await stateCollection.deleteOne({_id: delta.key}, {$set: delta}, {upsert: true});
  }
}


async function addTransactions(block){

  const txCollection = await transactionCollectionPromise;

  const tb = getTransactionsFromBlock(block);

  for(let n = 0; n < tb.length; n++){
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
}

function getTransactionsFromBlock(block){
  const sawtoothT = getSawtoothTransactionsFromBlock(block);
  return _.map(sawtoothT, sawtoothTransactionToTransaction);
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

async function removeDataAfterBlockNumInclusive(block_num){
  await removeTransactionsAfterBlockNumInclusive(block_num);
  await removeStateHistoryAfterBlockNumInclusive(block_num);
  await recalculateState();
}

async function removeTransactionsAfterBlockNumInclusive(block_num){
  const transactionCollection = await transactionCollectionPromise;
  await transactionCollection.deleteMany({block_num: {$gte: block_num}});

}


async function removeStateHistoryAfterBlockNumInclusive(block_num){
  const stateCollection = await stateCollectionPromise;
  await stateCollection.deleteMany({block_num: {$gte: block_num}});

}

async function recalculateState(){
  const stateCollection = await stateCollectionPromise;
  await stateCollection.deleteMany({});


  const stateHistoryCollection = await stateHistoryCollectionPromise;
  const cursor = stateHistoryCollection.aggregate([{$group: {_id: "$key"}}]);

  while(await cursor.hasNext()){
    const key = await cursor.next();

    const delta = await getCurrentDeltaFromHistory(key._id);
    if(delta){
      await applyDeltaToState(delta);
    }
  }

}

async function getCurrentDeltaFromHistory(key){
  const stateHistoryCollection = await stateHistoryCollectionPromise;
  const cursor = stateHistoryCollection.find({key}).sort({block_num: -1}).limit(1);

  let currentState = null;

  while(await cursor.hasNext()){
    currentState = await cursor.next();
  }
  return currentState;
}

module.exports = {SAWTOOTH_PREFIX, addState, addTransactions, removeDataAfterBlockNumInclusive};