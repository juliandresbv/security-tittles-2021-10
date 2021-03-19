const _ = require('underscore');
const crypto = require('crypto');
const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const SAWTOOTH_FAMILY = 'todo';
const SAWTOOTH_PREFIX = hash512(SAWTOOTH_FAMILY).substring(0, 6);

const mongo = require('./mongodb/mongo');


const transactionCollectionPromise = mongo.client().then((client) => {
  return client.db('mydb').collection(`${SAWTOOTH_FAMILY}_transaction`);
});

const stateCollectionPromise = mongo.client().then((client) => {
  return client.db('mydb').collection(`${SAWTOOTH_FAMILY}_state`);
});

const stateHistoryCollectionPromise = mongo.client().then((client) => {
  return client.db('mydb').collection(`${SAWTOOTH_FAMILY}_state_history`);
});


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


async function transactionTransform(transaction){
  const txCollection = await transactionCollectionPromise;

  let p = JSON.parse(transaction.payload);

  if(p.input){
    let prev = await txCollection.findOne({_id: p.input});
    transaction.input = prev._id;
    transaction.root = prev.root;
    transaction.idx = prev.idx + 1;
  }
  else{
    transaction.input = null;
    transaction.root = transaction.txid;
    transaction.idx = 0;
  }

  return transaction;
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

module.exports = {SAWTOOTH_FAMILY, SAWTOOTH_PREFIX, removeDataAfterBlockNumInclusive, transactionTransform};