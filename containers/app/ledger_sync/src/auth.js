const _ = require('underscore');
const crypto = require('crypto');
const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');


const SAWTOOTH_FAMILY = 'auth';
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


async function transactionTransform(transaction){
  return transaction;
}

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

async function removeDataAfterBlockNumInclusive(block_num){
  const transactionCollection = await transactionCollectionPromise;
  const stateCollection = await stateCollectionPromise;

  await transactionCollection.deleteMany({block_num: {$gte: block_num}});
  await stateCollection.deleteMany({block_num: {$gte: block_num}});


  await recalculateState();
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

module.exports = {SAWTOOTH_FAMILY, SAWTOOTH_PREFIX, addState, removeDataAfterBlockNumInclusive, transactionTransform};