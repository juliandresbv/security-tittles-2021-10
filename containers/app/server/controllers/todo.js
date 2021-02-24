var _ = require('underscore');
const protobuf = require('sawtooth-sdk/protobuf');
const { sendTransaction, 
  getAddress, 
  sendTransactionWithAwait, 
  queryState } = require('../sawtooth/sawtooth-helpers')

const TRANSACTION_FAMILY = 'todos';
const TRANSACTION_FAMILY_VERSION = '1.0';

const crypto = require('crypto');
const { default: axios } = require("axios");

const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const hash256 = (x) =>
  crypto.createHash('sha256').update(x).digest('hex');

function buildAddress(transactionFamily){
  return (key) => {
    return getAddress(transactionFamily, key);
  }
}

const address = buildAddress(TRANSACTION_FAMILY);

module.exports.getAllToDo = async function(req, res) {

  let params = {
    headers: {'Content-Type': 'application/json'}
  };

  const INT_KEY_NAMESPACE = hash512(TRANSACTION_FAMILY).substring(0, 6)
  let query = await axios.get(`${process.env.SAWTOOTH_REST}/state?address=${INT_KEY_NAMESPACE}&limit=${20}`, params);
  console.log(query.data.data);
  let allTodos = _.chain(query.data.data)
    .map((d) => {
      let base = JSON.parse(Buffer.from(d.data, 'base64'));
      return base;
    })
    .flatten()
    .value();

  res.json(allTodos);

};

module.exports.getToDo = async function(req, res) {
  try{
    let values = await queryState(address(req.params.id + ""));
    let value = _.find(values, v => v.key == req.params.id + "");
    if(!value){
      return res.status(404).json("not found"); 
    }
    return res.json(value);
  }
  catch(e){
    if(e.response && e.response.status === 404){
      return res.status(404).json(e.response.data) 
    }
    return res.status(500).json({error:e})
  }
}


module.exports.postToDo = async function(req, res) {
  const {transaction, txid} = req.body;
  const transactionFamily = 'todos';
  const transactionFamilyVersion = '1.0';
  const address = getAddress(transactionFamily, txid);

  const payload = JSON.stringify({func: 'post', args:{transaction, txid}});
  
  try{
    await sendTransaction(
      transactionFamily, 
      transactionFamilyVersion,
      [address],
      [address],
      payload);
    
    return res.json({msg:'ok'});
  }
  catch(err){
    return res.status(500).json({err});
  }
};

module.exports.putToDo = async function(req, res) {
  const {transaction, txid} = req.body;
  const transactionFamily = 'todos';
  const transactionFamilyVersion = '1.0';

  const input = getAddress(transactionFamily, JSON.parse(transaction).input);
  const address = getAddress(transactionFamily, txid);

  const payload = JSON.stringify({func: 'put', args:{transaction, txid}});
  
  try{
    await sendTransactionWithAwait(
      transactionFamily, 
      transactionFamilyVersion,
      [input, address],
      [input, address],
      payload);
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


