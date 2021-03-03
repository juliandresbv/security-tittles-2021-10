var _ = require('underscore');
const crypto = require('crypto');
const protobuf = require('sawtooth-sdk/protobuf');
const { 
  sendTransaction, 
  getAddress, 
  sendTransactionWithAwait, 
  queryState } = require('../sawtooth/sawtooth-helpers')

const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const TRANSACTION_FAMILY = 'todos';
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

  let params = {
    headers: {'Content-Type': 'application/json'}
  };

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



function readFile(file){
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) =>{
      if(err){
        resolve(null);
      }
      try{
        let p = JSON.parse(data);
        return resolve(p);
      }
      catch(e){
        resolve(null);
      }
    });
  });
}

module.exports.getToDoHistory = async function(req, res) {
  let blocks = await readFile('./data/blocks.json');


  let transactions = _.chain(blocks)
    .map(block => {
      return _.chain(block.batches)
        .map(b => {
          return _.map(b.transactions, t => {
            let payload;
            try{
              payload = JSON.parse(Buffer.from(t.payload, 'base64').toString('utf-8'));
            }
            catch(err){
              payload = Buffer.from(t.payload, 'base64').toString('utf-8');
            }
            return {
              // block_id: block.block_id,
              block_num: block.block_num,
              // batch_id: b.header_signature,
              // transaction_id: t.header_signature,
              payload: payload,
              family_name: t.header.family_name
            };
          });
        })
        .flatten()
        .value();
    })
    .flatten()
    .filter(t => t.family_name === 'todos')
    .indexBy(t => t.payload.args.txid)
    .value();

  let current = transactions[req.params.id];
  let r = [current];

  while(current != null){
    let p = JSON.parse(current.payload.args.transaction);
    current = transactions[p.input];
    if(r != null){
      r.push(current);
    }
  }
  return res.json(r);
}