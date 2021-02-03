const { ethers } = require("ethers");
var _ = require('underscore');
const axios = require('axios');
const CancelToken = axios.CancelToken;

const {
  sendTransaction,
  sendTransactionWithAwait,
  queryState, 
} = require('../sawtooth/sawtooth-helpers');
const TRANSACTION_FAMILY = 'intkey';

const TIMEOUT = 1000*10;


let todos = [
  {id: 1, text: "laundry"},
];


module.exports.getAllToDo = function(req, res) {
  res.json(todos);
};

module.exports.getToDo = async function(req, res) {
  try{
    let value = await queryState(TRANSACTION_FAMILY, req.params.id+"");
    return res.json(JSON.parse(value[req.params.id]));
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

  let content = JSON.parse(payload);
  const newId = _.max(todos, (e) => {return e.id}).id + 1;
  todos.push({id: newId, text: content.text});

  try{
    let value = await sendTransactionWithAwait(TRANSACTION_FAMILY, req.body, newId);
    return res.json(value);
  }
  catch(err){
    console.log(err.message);
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
  let content = JSON.parse(payload);
  todos = _.map(todos, e => {
    if(e.id == req.params.id){
      // return {...e, text: content.text}
      let c = _.clone(e);
      c['text'] = content.text;
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

  const newId = req.params.id;

  try{
    let value = await sendTransactionWithAwait(TRANSACTION_FAMILY, req.body, newId);
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


