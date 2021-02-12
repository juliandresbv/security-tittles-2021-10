const { ethers } = require("ethers");
var _ = require('underscore');
const protobuf = require('sawtooth-sdk/protobuf');

const {
  sendTransactionWithAwait,
  queryState, 
} = require('../sawtooth/sawtooth-helpers');
const TRANSACTION_FAMILY = 'intkey';
const TRANSACTION_FAMILY_VERSION = '1.0';

const crypto = require('crypto');
const { default: axios } = require("axios");

const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const hash256 = (x) =>
  crypto.createHash('sha256').update(x).digest('hex');

const getAddress = (transactionFamily, varName) => {
  const INT_KEY_NAMESPACE = hash512(transactionFamily).substring(0, 6)
  return INT_KEY_NAMESPACE + hash512(varName).slice(-64)
}

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

  // console.log(req.body.batch);
  let batchListBytes = Buffer.from(req.body.batch, 'base64');
  // console.log(Buffer.from(batchListBytes).toString('base64'));
  // const batcheList = protobuf.BatchList.decode(batchListBytes);

  // const batch = batcheList.batches[0];

  // let batchHeader = protobuf.BatchHeader.decode(batch.header);
  // let batchSigner = batchHeader.signerPublicKey;


  // let transactions = _.map(batch.transactions, (n) =>{
  //   // console.log(n.payload);
  //   return {
  //     signerPublicKey: protobuf.TransactionHeader.decode(n.header).signerPublicKey,
  //     payload: JSON.parse(Buffer.from(n.payload).toString('utf8'))
  //   }

  // });

  // let batchListBytes2 = Buffer.from('CrkHCscBCkIwMjRhNjkzMjBkM2RhOWRkMzNlMWRlZmE1ZTgwNzhkZjAxOWIxNGJmMTE2ODRlOTYzODg5YjFkZDhhMDBjOTkxYTcSgAEzMzFiYjk4YTk5NmNlMTAxMmRlNzMzOGM0MTdkOWU0NjFjNjFmNjFmOTJlYzBhYjNhMDFkZDhiYmMwYzNmYTMyNWZhYjUwYjYzYmNlMzAyMzAxNzI3ZmNmMmNhODg3MWY1NDc1YjZkZDFiYzc0OTFmOWJlMDBiNzdmOWM3ZDkwZhKAATM1MTdjMmQ3MzJmNTZkMTk2ZThhNGQwMDk4ZGJkZWY0YzVmNGE4ZmUwZTIzZTA2NjFlYTAzNDUyYzVlNDY2NWQ2OTZkYTNiZmMzNTMzZmEzMzk5MzdlZmE2OTEyODkzMzBhODNkOTQyZmQzNDg1NTllNzE1YjA5NDk5MWQ0NWNmGukECq8DCkIwMjRhNjkzMjBkM2RhOWRkMzNlMWRlZmE1ZTgwNzhkZjAxOWIxNGJmMTE2ODRlOTYzODg5YjFkZDhhMDBjOTkxYTcaBmludGtleSIDMS4wKkYxY2YxMjZmNDUxN2JkYTRhNjk1ZjAyZDBhNzNkZDRkYjU0M2I0NjUzZGYyOGY1ZDA5ZGFiODZmOTJmZmI5Yjg2ZDAxZTI1MgVub25jZTpGMWNmMTI2ZjQ1MTdiZGE0YTY5NWYwMmQwYTczZGQ0ZGI1NDNiNDY1M2RmMjhmNWQwOWRhYjg2ZjkyZmZiOWI4NmQwMWUyNUqAATJiYjEzZWM2NTI3MTdjZTA2OWE2NzBmYTU4YzEwZDU1MWI2YTNkYzBmNTU5NTg4Nzk3YmUwN2Y2OGIzOTM1MDI4YWFlYWY2YmJhMWFjNjk0N2JiOTQzODYwMzM3MTc5NmI1NjZlZjQ0M2MxZjY4NmYzNzU0MzY0OTM2NTdjZDc2UkIwMjRhNjkzMjBkM2RhOWRkMzNlMWRlZmE1ZTgwNzhkZjAxOWIxNGJmMTE2ODRlOTYzODg5YjFkZDhhMDBjOTkxYTcSgAEzMzFiYjk4YTk5NmNlMTAxMmRlNzMzOGM0MTdkOWU0NjFjNjFmNjFmOTJlYzBhYjNhMDFkZDhiYmMwYzNmYTMyNWZhYjUwYjYzYmNlMzAyMzAxNzI3ZmNmMmNhODg3MWY1NDc1YjZkZDFiYzc0OTFmOWJlMDBiNzdmOWM3ZDkwZhoyeyJmdW5jIjoicHV0IiwicGFyYW1zIjp7ImlkIjoiNSIsInZhbHVlIjoiSEVMTE8ifX0=',
  //   'base64');

  // console.log(batchListBytes == batchListBytes2)
  // console.log(batchListBytes.toString('base64'))
  // console.log(batchListBytes2.toString('base64'))

  let params = {
    headers: {'Content-Type': 'application/octet-stream'}
  };
  
  try{
    let r = await axios.post(`${process.env.SAWTOOTH_REST}/batches`, batchListBytes, params)
    return res.json({msg: "hi"});
  }
  catch(err){
    console.log(err.data);
    return res.status(500).json({err});
  }

  // try{
  //   const inputs = [getAddress(TRANSACTION_FAMILY, payloadJ.args.id + "")];
  //   const outputs = inputs;
  //   let value = await sendTransactionWithAwait(TRANSACTION_FAMILY, 
  //     TRANSACTION_FAMILY_VERSION, 
  //     inputs, 
  //     outputs, 
  //     JSON.stringify(req.body));
  //   return res.json(value);
  // }
  // catch(err){
  //   if(err.message === 'Timeout'){
  //     return res.status(500).json({msg: "Timeout"});
  //   }
  //   else if(err.message === 'PENDING transaction'){
  //     return res.status(500).json({msg: "PENDING", data: err.data});
  //   }
  //   return res.status(500).json({msg: err});
  // }
  
};


module.exports.putToDo = async function(req, res) {

  console.log('hi');

  let {signature, payload} = req.body;
  if(!signature){
    return res.status(400).json({msg:"no signature"})
  }
  if(!isValidSignature(req)){
    return res.status(400).json({msg:"bad signature"})
  }
  let payloadJ = JSON.parse(payload);
  
  try{
    const inputs = [getAddress(TRANSACTION_FAMILY, payloadJ.args.id + "")];
    const outputs = inputs;
    let value = await sendTransactionWithAwait(TRANSACTION_FAMILY, 
      TRANSACTION_FAMILY_VERSION, 
      inputs, 
      outputs, 
      JSON.stringify(req.body));
    return res.json(value);
  }
  catch(err){
    console.log(err);
    if(err.message === 'Timeout'){
      return res.status(500).json({msg: "Timeout"});
    }
    else if(err.message === 'PENDING transaction'){
      return res.status(500).json({msg: "PENDING", data: err.data});
    }
    return res.status(500).json({msg: err});
  }

};

function isValidSignature(req){

  const {signature, payload, publickey} = req.body;
  if(!signature || !payload || !publickey){
    return false;
  }
  const hashEthers = ethers.utils.hashMessage(payload);
  const recoveredPubKeyUncompressed = ethers.utils.recoverPublicKey(hashEthers, signature);
  const recoveredPubKey = ethers.utils.computePublicKey(
    recoveredPubKeyUncompressed, true);

  return publickey === recoveredPubKey;
}


