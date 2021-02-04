const { ethers } = require("ethers");
var _ = require('underscore');

const {
  sendTransactionWithAwait,
  queryState, 
} = require('../sawtooth/sawtooth-helpers');
const TRANSACTION_FAMILY = 'intkey';
const TRANSACTION_FAMILY_VERSION = '1.0';

const crypto = require('crypto');

const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const hash256 = (x) =>
  crypto.createHash('sha256').update(x).digest('hex');

const getAddress = (transactionFamily, varName) => {
  const INT_KEY_NAMESPACE = hash512(transactionFamily).substring(0, 6)
  return INT_KEY_NAMESPACE + hash512(varName).slice(-64)
}

let todos = [];


module.exports.getAllToDo = function(req, res) {
  res.json(todos);
};

module.exports.getToDo = async function(req, res) {
  try{
    const address = getAddress(TRANSACTION_FAMILY, req.params.id + "");
    let values = await queryState(address);
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

  let {signature, payload} = req.body;
  if(!signature){
    return res.status(400).json({msg:"no signature"})
  }
  if(!isValidSignature(req)){
    return res.status(400).json({msg:"bad signature"})
  }

  let payloadJ = JSON.parse(payload);
  let newId = payloadJ.args.id;
  todos.push({
    id: newId, 
    text: payloadJ.args.text
  });

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
    if(err.message === 'Timeout'){
      return res.status(500).json({msg: "Timeout"});
    }
    else if(err.message === 'PENDING transaction'){
      return res.status(500).json({msg: "PENDING", data: err.data});
    }
    return res.status(500).json({msg: err});
  }
  
};


module.exports.putToDo = async function(req, res) {
  let {signature, payload} = req.body;
  if(!signature){
    return res.status(400).json({msg:"no signature"})
  }
  if(!isValidSignature(req)){
    return res.status(400).json({msg:"bad signature"})
  }
  let payloadJ = JSON.parse(payload);
  let newId = payloadJ.args.id;

  todos = _.map(todos, e => {
    if(e.id == newId){
      // return {...e, text: content.text}
      let c = _.clone(e);
      c['text'] = payloadJ.args.text;
      return c;
    }
    return e;
  })
  
  const elem = _.find(todos, (e) =>{
    return e.id == req.params.id
  });

  if(!elem){
    return res.status(404).json({msg: "Not found"});
  }

  
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


