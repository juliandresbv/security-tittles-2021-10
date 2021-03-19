const _ = require('underscore');
const mongo = require('../mongodb/mongo');

const sawtoothHelper = require('./sawtooth-helpers');

async function handler(secondHandlers, block, events){
  // console.log(block);

  //https://github.com/hyperledger-archives/sawtooth-supply-chain/blob/master/ledger_sync/db/blocks.js
  // If the blockNum did not already exist, or had the same id
  // there is no fork, return the block
  
  let blockByNum = await findBlockByNum(block.block_num);
  
  const blockCollection = await blockCollectionPromise;

  const transactions = getSawtoothTransactionsFromBlock(block);

  if(!blockByNum || blockByNum.block_id === block.block_id ){ //No fork

    for(let n = 0; n < secondHandlers.length; n ++){
      let h = secondHandlers[n];
      
      await h.addTransaction(transactions);
      await h.addState(block, events);
    }
    await blockCollection.updateOne({_id: block.block_id},{$set:{_id: block.block_id, ...block}}, {upsert: true});

  }
  else{ // Fork
    console.log('FORK!!')
    //Remove invalid data
    for(let n = 0; n < secondHandlers.length; n ++){
      let h = secondHandlers[n];
      
      await h.removeDataAfterBlockNumInclusive(block.block_num);
    }

    await removeBlocksAfterBlockNumInclusive(block.block_num);

    for(let n = 0; n < secondHandlers.length; n ++){
      let h = secondHandlers[n];
      
      await h.addTransaction(transactions);
      await h.addState(block, events);
    }
    await blockCollection.updateOne({_id: block.block_id},{$set:{_id: block.block_id, ...block}}, {upsert: true});

  }
}

function removeDataAfterBlockNumInclusiveBuilder(transaction_family){
  const transactionCollectionPromise = mongo.client().then((client) => {
    return client.db('mydb').collection(`${transaction_family}_transaction`);
  });
  const stateHistoryCollectionPromise = mongo.client().then((client) => {
    return client.db('mydb').collection(`${transaction_family}_state_history`);
  });
  const stateCollectionPromise = mongo.client().then((client) => {
    return client.db('mydb').collection(`${transaction_family}_state`);
  });

  return async function(block_num){
    const transactionCollection = await transactionCollectionPromise;
    await transactionCollection.deleteMany({block_num: {$gte: block_num}});

    const stateHistoryCollection = await stateHistoryCollectionPromise;
    await stateHistoryCollection.deleteMany({block_num: {$gte: block_num}});

    const stateCollection = await stateCollectionPromise;
    await stateCollection.deleteMany({});

    await recalculateState();
  }

  async function recalculateState(){
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

}


function addTransactionsBuilder(transaction_family, transactionTransform){
  const transactionCollectionPromise = mongo.client().then((client) => {
    return client.db('mydb').collection(`${transaction_family}_transaction`);
  });
 

  return async function (transactions){

    const txCollection = await transactionCollectionPromise;
  
    const tb = _.chain(transactions)
      .filter(t => t.family_name === transaction_family)
      .map(t => sawtoothTransactionToTransaction(t))
      .value();
  
    for(let n = 0; n < tb.length; n++){
  
      const t = tb[n];
      let t_new = _.clone(t);
      t_new._id = t_new.txid;
  
      const t2 = await transactionTransform(t_new);
      await txCollection.updateOne({_id: t2._id}, {$set: t2}, {upsert: true});
      
    }
  }
}


function addStateBuilder(transaction_family, transaction_prefix){
  const stateHistoryCollectionPromise = mongo.client().then((client) => {
    return client.db('mydb').collection(`${transaction_family}_state_history`);
  });
  const stateCollectionPromise = mongo.client().then((client) => {
    return client.db('mydb').collection(`${transaction_family}_state`);
  });

  return async function (block, events){

    const stateHistoryCollection = await stateHistoryCollectionPromise;
  
    const filteredEvents = _.filter(events, e => e.address.startsWith(transaction_prefix));
  
    const deltas = await getStateDeltas(block, filteredEvents);
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
      await stateCollection.deleteOne({_id: delta.key});
    }
  }
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

const blockCollectionPromise = mongo.client().then((client) => {
  return client.db('mydb').collection('block');
});

async function findBlockByNum(block_num){
  const blockCollection = await blockCollectionPromise;
  return await blockCollection.findOne({block_num});
}

async function removeBlocksAfterBlockNumInclusive(block_num){
  const blockCollection = await blockCollectionPromise;
  await blockCollection.deleteMany({block_num: {$gte: block_num}});
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
    .value();
}

async function lastBlockId(){
  let lastBlock = sawtoothHelper.NULL_BLOCK_ID;

  const blockCollection = await blockCollectionPromise;
  const cursor = await blockCollection.find({}).sort({block_num: -1}).limit(1);
  await new Promise((resolve, reject) => {
    cursor.forEach((doc)=>{
      lastBlock = doc.block_id
    }, 
    resolve)
  });
  return lastBlock;
}

const create = (handlers) => {

  const secondHandlers = _.map(handlers, (h) => {
    return {
      addTransaction: addTransactionsBuilder(h.SAWTOOTH_FAMILY, h.transactionTransform),
      addState: addStateBuilder(h.SAWTOOTH_FAMILY, h.SAWTOOTH_PREFIX),
      removeDataAfterBlockNumInclusive: removeDataAfterBlockNumInclusiveBuilder(h.SAWTOOTH_FAMILY)
    }
  });

  return (block, events) => {
    handler(secondHandlers, block, events);
  }

};


module.exports = {
  lastBlockId, create
}