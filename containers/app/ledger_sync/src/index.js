const _ = require('underscore');
const mongo = require('./mongodb/mongo');
const todo = require('./todo');
const auth = require('./auth');

const TODO_PREFIX = todo.SAWTOOTH_PREFIX;
const AUTH_PREFIX = auth.SAWTOOTH_PREFIX;

const sawtoothHelper = require('./sawtooth/sawtooth-helpers');

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
  {
    eventType: 'sawtooth/state-delta',
    filters: [{
      key: 'address',
      matchString: `^${AUTH_PREFIX}.*`,
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

async function blockCommitHandler(block, events){
  // console.log(block);

  //https://github.com/hyperledger-archives/sawtooth-supply-chain/blob/master/ledger_sync/db/blocks.js
  // If the blockNum did not already exist, or had the same id
  // there is no fork, return the block
  
  let blockByNum = await findBlockByNum(block.block_num);
  
  const blockCollection = await blockCollectionPromise;

  const transactions = getSawtoothTransactionsFromBlock(block);

  if(!blockByNum || blockByNum.block_id === block.block_id ){ //No fork
    await todo.addState(block, events);
    await todo.addTransactions(transactions);

    // await auth.addTransactions(block);
    await blockCollection.updateOne({_id: block.block_id},{$set:{_id: block.block_id, ...block}}, {upsert: true});

  }
  else{ // Fork
    console.log('FORK!!')
    //Remove invalid data
    await todo.removeDataAfterBlockNumInclusive(block.block_num);
    await removeBlocksAfterBlockNumInclusive(block.block_num);

    // await recalculateState();

    await todo.addState(block, events);
    await todo.addTransactions(transactions);
    await blockCollection.updateOne({_id: block.block_id},{$set:{_id: block.block_id, ...block}}, {upsert: true});

  }
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

module.exports = {handlers, lastBlockId};