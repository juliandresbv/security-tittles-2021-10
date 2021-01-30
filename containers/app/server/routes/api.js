var express = require('express');
var router = express.Router();
var _ = require('underscore');

const { ethers } = require("ethers");


let todos = [
  {id: 10, text: "laundry"},
  {id: 12, text: "cook"},
  {id: 13, text: "sweep"},
];

router.get('/', function(req, res) {
  res.json(todos);
});

router.post('/', function(req, res) {

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
  return res.json(todos[todos.length - 1]); 
});

router.get('/:id', function(req, res) {
  const elem = _.find(todos, (e) =>{
    return e.id == req.params.id
  });
  if(!elem){
    return res.status(404).json({msg: "Not found"});
  }
  res.json(elem);
});

router.put('/:id', function(req, res) {

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
  res.json(elem);
});

router.use('/*', function(req, res){
  res.status(404).json({msg: 'Resource not found'});
});

module.exports = router;


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
