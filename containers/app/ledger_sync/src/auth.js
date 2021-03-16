const _ = require('underscore');
const crypto = require('crypto');
const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');
const SAWTOOTH_PREFIX = hash512("auth").substring(0, 6);

const mongo = require('./mongodb/mongo');

const transactionCollectionPromise = mongo.client().then((client) => {
  return client.db('mydb').collection('auth_transaction');
});

async function addTransactions(transactions){

  const txCollection = await transactionCollectionPromise;

  const tb = _.chain(transactions)
    .filter(t => t.family_name === 'auth')
    .map(t => sawtoothTransactionToTransaction(t))
    .value();

  for(let n = 0; n < tb.length; n++){

    const t = tb[n];
    let t_new = _.clone(t);
    t_new._id = t_new.txid;
    await txCollection.updateOne({_id: t_new._id}, {$set: t_new}, {upsert: true});
    
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

module.exports = {SAWTOOTH_PREFIX, /*addState,*/ addTransactions, /*removeDataAfterBlockNumInclusive*/};