const crypto = require('crypto');
const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const SAWTOOTH_FAMILY = 'todo';
const SAWTOOTH_PREFIX = hash512(SAWTOOTH_FAMILY).substring(0, 6);

const mongo = require('./mongodb/mongo');


async function transactionTransform(transaction){
  const txCollection = mongo.client().db('mydb').collection(`${SAWTOOTH_FAMILY}_transaction`);

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


module.exports = {SAWTOOTH_FAMILY, SAWTOOTH_PREFIX, transactionTransform};