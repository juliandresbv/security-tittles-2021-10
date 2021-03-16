const _ = require('underscore');
const crypto = require('crypto');
const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');
const SAWTOOTH_PREFIX = hash512("auth").substring(0, 6);

const mongo = require('./mongodb/mongo');


const transactionCollectionPromise = mongo.client().then((client) => {
  return client.db('mydb').collection('auth_transaction');
});

const stateCollectionPromise = mongo.client().then((client) => {
  return client.db('mydb').collection('auth_state');
});

const stateHistoryCollectionPromise = mongo.client().then((client) => {
  return client.db('mydb').collection('auth_state_history');
});

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

module.exports = {SAWTOOTH_PREFIX, /*addState, addTransactions, removeDataAfterBlockNumInclusive*/};