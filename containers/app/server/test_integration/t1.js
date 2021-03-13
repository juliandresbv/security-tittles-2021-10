require('dotenv').config()
const { ethers } = require("ethers");
const secp256k1 = require('secp256k1');
const { default: axios } = require("axios");
const mongo = require('../mongodb/mongo');
const _ = require('underscore');

const assert = require('chai').assert;

const privKey1 = Buffer.from(
  "7f664d71e4200b4a2989558d1f6006d0dac9771a36a546b1a47c384ec9c4f04b", 'hex');

const privKey2 = Buffer.from(
  "0e9fe89bebe111af51d8204b4e4e627764564aa003b7477f266f4f86e37179f3", 'hex');

const HOST = "http://localhost:3001";

async function buildTransaction(payload, privKey){
  const wallet = new ethers.Wallet(privKey);
  let transaction = JSON.stringify(payload);
  const txid = await wallet.signMessage(transaction);
  return {transaction, txid}
}

function getPublicKey(privKey){
  const wallet = new ethers.Wallet(privKey);
  let pubKey = secp256k1.publicKeyConvert(Uint8Array.from(Buffer.from(wallet.publicKey.substr(2), 'hex')), true);
  return Buffer.from(pubKey).toString('hex');
}

function sleep(time){
  return new Promise((resolve)=>{
    setTimeout(resolve,time); 
  })
}

async function main(){
  const msg = "hi there" + Math.random();

  let content = {
    type: 'todo',
    id: 10,
    
    input: null,
    output:{
      value:  msg,
      owner: getPublicKey(privKey1)
    }
  };
  let tx = await buildTransaction(content, privKey1);
  let res = await axios.post(`${HOST}/api/`, tx);

  assert.deepEqual(res.data, {msg: "ok"});

  const mongoClient = await mongo.client();
  const transactionCollection = mongoClient.db('mydb').collection("transaction");
  const blockCollection = mongoClient.db('mydb').collection("block");
  const stateCollection = mongoClient.db('mydb').collection("state");
  const stateHistoryCollection = mongoClient.db('mydb').collection("state_history");

  await sleep(2000);
  let t_mongo = await transactionCollection.findOne({_id: tx.txid});

  let tm = _.omit(t_mongo, 'block_num', 'batch_id', 'transaction_id','block_id');
  assert.deepEqual(tm, {
    _id: tx.txid,
    txid: tx.txid,
    idx: 0,
    input: null,
    root: tx.txid,
    payload: tx.transaction
  });

  assert.isTrue(t_mongo.block_num >= 0);
  assert.isNotNull(t_mongo.batch_id);
  assert.isNotNull(t_mongo.transaction_id);
  assert.isNotNull(t_mongo.block_id);


  let c = await stateHistoryCollection.find({key: tx.txid});
  let th;
  let num = 0;
  while(await c.hasNext()){
    th = await c.next();
    num++;
  }
  assert.equal(num, 1);
  assert.deepEqual(th.value, content.output)
  assert.equal(th._id, tx.txid)
  assert.isTrue(th.block_num >= 0);
  assert.isNotNull(th.address);


  console.log('--Ok--');
}


(async () => {
  try{
    await main();
  }
  c
  await mongo.close();

})();


