const { ethers } = require("ethers");
var _ = require('underscore');
const axios = require('axios');
const CancelToken = axios.CancelToken;

const {
  sendTransaction,
  queryState, 
  subscribeToSawtoothEvents,
  getAddress
} = require('../sawtooth/sawtooth-helpers');
const TRANSACTION_FAMILY = 'intkey';

const TIMEOUT = 1000*10;


let todos = [
  {id: 1, text: "laundry"},
];

module.exports.getAllToDo =function(req, res) {
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


  let timeoutTimer = undefined;
  let timer1 = undefined;
  let axiosSource = CancelToken.source();

  function releaseResources(){
    if(timeoutTimer){
      clearTimeout(timeoutTimer);
      timeoutTimer.unref();
    }
    if(timer1){
      clearTimeout(timer1);
      timer1.unref();
    }
    if(axiosSource){
      axiosSource.cancel();
    }
  }

  let storedValue;
  let finished = false;

  function respond(err, value){
    if(finished){
      return;
    }

    finished = true;
    releaseResources();

    if(err){
      console.log(err.message);
      if(err.message === 'Timeout'){
        return res.status(500).json({msg: "Timeout"});
      }
      else if(err.message === 'PENDING transaction'){
        return res.status(500).json({msg: "PENDING", data: err.data});
      }
      return res.status(500).json({msg: err});
    }
    return res.json(value);
  }

  timeoutTimer = setTimeout(() =>{
    respond(new Error('Timeout'));
  }, TIMEOUT);

  let statusLink;

  try{

    let response = await sendTransaction(TRANSACTION_FAMILY , {
      Action: 'set',
      Name: newId + '',
      Value: JSON.stringify(req.body)
    }, axiosSource.token);

    if(!response.data || !response.data.link){
      return respond(new Error("Transaction response err"));
    }
    statusLink = response.data.link;
  }
  catch(e){
    return respond(e);
  }


  try{
    let batchStatus;
    retries = 0;
    while(batchStatus !== "COMMITTED" && retries < 20){
      if(finished){
        return;
      }
      await new Promise((resolve) => {
        timer1 = setTimeout(resolve, 200 + 100*Math.pow(2, retries));
      });


      let value = await axios.get(`${statusLink}&wait=4`, {
        cancelToken: axiosSource.token
      });
  
      if(value.data && 
        value.data.data && 
        value.data.data[0]){
          batchStatus = value.data.data[0].status;
          if(batchStatus === 'INVALID'){
            break;
          }
        }
      retries = retries + 1;
    }
    //https://sawtooth.hyperledger.org/docs/core/nightly/1-1/rest_api/endpoint_specs.html
    if(batchStatus !== "COMMITTED"){
      if(batchStatus === 'INVALID'){
        return respond(new Error('Invalid transaction'));
      }
      else if(batchStatus === 'PENDING'){
        let err = new Error('PENDING transaction');
        err.data = {statusLink}
        return respond(err);
      }
      else if(batchStatus === 'UNKNOWN'){
        return respond(new Error('Unknown transaction'));
      }
      else{
        return respond(new Error('Unknown error'));
      }
    }

  }
  catch(e){
    return respond(e);
  }


  if(finished){
    return;
  }

  try{
    let value = await queryState(TRANSACTION_FAMILY, newId + '', axiosSource.token);
    return respond(null,{
      key: newId + '',
      value: value
    });
  }
  catch(e){
    return respond(e);
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
      return {...e, text: content.text}
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

  let timeoutTimer = undefined;
  let timer1 = undefined;
  let axiosSource = CancelToken.source();

  function releaseResources(){
    if(timeoutTimer){
      clearTimeout(timeoutTimer);
      timeoutTimer.unref();
    }
    if(timer1){
      clearTimeout(timer1);
      timer1.unref();
    }
    if(axiosSource){
      axiosSource.cancel();
    }
  }

  let storedValue;
  let finished = false;

  function respond(err, value){
    if(finished){
      return;
    }

    finished = true;
    releaseResources();

    if(err){
      console.log(err.message);
      if(err.message === 'Timeout'){
        return res.status(500).json({msg: "Timeout"});
      }
      else if(err.message === 'PENDING transaction'){
        return res.status(500).json({msg: "PENDING", data: err.data});
      }
      return res.status(500).json({msg: err});
    }
    return res.json(value);
  }

  timeoutTimer = setTimeout(() =>{
    respond(new Error('Timeout'));
  }, TIMEOUT);

  let statusLink;

  try{

    let response = await sendTransaction(TRANSACTION_FAMILY , {
      Action: 'set',
      Name: newId + '',
      Value: JSON.stringify(req.body)
    }, axiosSource.token);

    if(!response.data || !response.data.link){
      return respond(new Error("Transaction response err"));
    }
    statusLink = response.data.link;
  }
  catch(e){
    return respond(e);
  }


  try{
    let batchStatus;
    retries = 0;
    while(batchStatus !== "COMMITTED" && retries < 20){
      if(finished){
        return;
      }
      await new Promise((resolve) => {
        timer1 = setTimeout(resolve, 200 + 100*Math.pow(2, retries));
      });


      let value = await axios.get(`${statusLink}&wait=4`, {
        cancelToken: axiosSource.token
      });
  
      if(value.data && 
        value.data.data && 
        value.data.data[0]){
          batchStatus = value.data.data[0].status;
          if(batchStatus === 'INVALID'){
            break;
          }
        }
      retries = retries + 1;
    }
    //https://sawtooth.hyperledger.org/docs/core/nightly/1-1/rest_api/endpoint_specs.html
    if(batchStatus !== "COMMITTED"){
      if(batchStatus === 'INVALID'){
        return respond(new Error('Invalid transaction'));
      }
      else if(batchStatus === 'PENDING'){
        let err = new Error('PENDING transaction');
        err.data = {statusLink}
        return respond(err);
      }
      else if(batchStatus === 'UNKNOWN'){
        return respond(new Error('Unknown transaction'));
      }
      else{
        return respond(new Error('Unknown error'));
      }
    }

  }
  catch(e){
    return respond(e);
  }


  if(finished){
    return;
  }

  try{
    let value = await queryState(TRANSACTION_FAMILY, newId + '', axiosSource.token);
    return respond(null,{
      key: newId + '',
      value: value
    });
  }
  catch(e){
    return respond(e);
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


