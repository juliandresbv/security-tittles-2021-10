var _ = require('underscore');
const crypto = require('crypto');
const mongo = require('../mongodb/mongo')
const { 
  sendTransaction, 
  getAddress, 
  sendTransactionWithAwait, 
  queryState } = require('../sawtooth/sawtooth-helpers')

const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const TRANSACTION_FAMILY = 'todo';
const TRANSACTION_FAMILY_VERSION = '1.0';
const INT_KEY_NAMESPACE = hash512(TRANSACTION_FAMILY).substring(0, 6)

const { default: axios } = require("axios");
const fs = require('fs');

function buildAddress(transactionFamily){
  return (key) => {
    return getAddress(transactionFamily, key);
  }
}

const address = buildAddress(TRANSACTION_FAMILY);

module.exports.getAllToDo = async function(req, res) {

  const mongoClient = await mongo.client();
  const stateCollection = mongoClient.db('mydb').collection("todo_state");

  const page = req.query.page || 0; 

  const cursor = stateCollection.find({"value.owner": req.auth.jwt.publicKey})
    .skip(PAGE_SIZE*page)
    .limit(PAGE_SIZE);

  let todos = [];
  await new Promise((resolve, reject) => {
    cursor.forEach((doc)=>{
      todos.push(doc);
    }, 
    resolve)
  });

  res.json(todos);

};

module.exports.getToDo = async function(req, res) {
  const mongoClient = await mongo.client();
  const stateCollection = mongoClient.db('mydb').collection("todo_state");

  const value = await stateCollection.findOne({"_id": req.params.id});
  if(!value){
    return res.status(404).json("not found"); 
  }
  return res.json(value);
}


module.exports.postToDo = async function(req, res) {
  const {transaction, txid} = req.body;
  const address = getAddress(TRANSACTION_FAMILY, txid);

  const payload = JSON.stringify({func: 'post', args:{transaction, txid}});
  
  try{
    await sendTransaction([{
      transactionFamily: TRANSACTION_FAMILY, 
      transactionFamilyVersion: TRANSACTION_FAMILY_VERSION,
      inputs: [address],
      outputs: [address],
      payload
    }]);
    return res.json({msg:'ok'});
  }
  catch(err){
    return res.status(500).json({err});
  }
};

module.exports.putToDo = async function(req, res) {
  const {transaction, txid} = req.body;
  const input = getAddress(TRANSACTION_FAMILY, JSON.parse(transaction).input);
  const address = getAddress(TRANSACTION_FAMILY, txid);

  const payload = JSON.stringify({func: 'put', args:{transaction, txid}});

  try{
    await sendTransactionWithAwait([
      {
        transactionFamily: TRANSACTION_FAMILY, 
        transactionFamilyVersion: TRANSACTION_FAMILY_VERSION, 
        inputs: [input, address],
        outputs: [input, address],
        payload
      }
    ]);

    return res.json({msg:'ok'});

  }
  catch(err){
    let errMsg;
    if(err.data){
      errMsg = err.data;
      if(err.message == 'Invalid transaction'){
        errMsg = "Invalid Transaction: " + err.data.data[0].invalid_transactions[0].message;
      }
      else {
        errMsg = err;
      }
    }
    else{
      errMsg = err;
    }
    return res.status(500).json({msg: errMsg});
  }
};

const PAGE_SIZE = (process.env.PAGE_SIZE)? parseInt(process.env.PAGE_SIZE): 10;

module.exports.getToDoHistory = async function(req, res) {

  const page = req.query.page || 0; 

  const mongoClient = await mongo.client();
  const transactionCollection = mongoClient.db('mydb').collection("todo_transaction");
  const stateCollection = mongoClient.db('mydb').collection("todo_state");

  const st = await stateCollection.findOne({_id: req.params.id});
  if(!st){
    return res.status(404).json({msg: "not UTXO"});
  }

  const tx = await transactionCollection.findOne({_id: req.params.id});
  if(!tx){
    return res.status(404).json({msg: "Transaction not found"});
  }

  let history = [];
  const cursor = await transactionCollection.find({root: tx.root})
    .sort({block_num: -1})
    .skip(PAGE_SIZE*page)
    .limit(PAGE_SIZE);
  await new Promise((resolve, reject) => {
    cursor.forEach((doc)=>{
      history.push(doc);
    }, 
    resolve)
  });
  return res.json(history);
}