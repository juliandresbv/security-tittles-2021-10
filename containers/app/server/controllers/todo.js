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



