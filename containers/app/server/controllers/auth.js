var _ = require('underscore');
var jwt = require('jsonwebtoken');
const {getPublicKey} = require('../helpers/signature');

const crypto = require('crypto');
const { 
  sendTransaction, 
  getAddress, 
  sendTransactionWithAwait, 
  queryState } = require('../sawtooth/sawtooth-helpers');

const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const TRANSACTION_FAMILY = 'auth';
const TRANSACTION_FAMILY_VERSION = '1.0';
const INT_KEY_NAMESPACE = hash512(TRANSACTION_FAMILY).substring(0, 6)

const { default: axios } = require("axios");

function buildAddress(transactionFamily){
  return (key) => {
    return getAddress(transactionFamily, key);
  }
}


function jwtVerify(token){
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, {ignoreExpiration: false}, (err, d)=>{
      if(err){
        return reject(err);
      }
      resolve(d);
    })
  });
}


module.exports.challange = async function(req, res){
  var token = jwt.sign({
    challange: Date.now()
  }, process.env.JWT_SECRET, { expiresIn: 60 });
  
  return res.json({challange: token});
}

module.exports.signin = async function(req, res){

  const  {email, publicKey, toSign, signature} = req.body;

  if(!email || !publicKey || !toSign || !signature){
    return res.status(401).json('Invalid signature');
  }

  const pubK1 = getPublicKey(toSign, signature);
  if(pubK1 !== publicKey){
    return res.status(401).json('Invalid signature');
  }

  try{
    let r = await jwtVerify(toSign.slice("Signin:".length));
    if((Date.now() - (new Date(r.challange).getTime())) > 60*1000){
      return res.status(401).json('Old Challange');
    }
  }
  catch(err){
    return res.status(401).json(err.message);
  }

  var token = jwt.sign({
    publicKey 
  }, process.env.JWT_SECRET, { expiresIn: 60 * 60 });
  

  console.log('signin', req.body)
  return res.json({token});
}

module.exports.signup = async function(req, res){
  const  {email, publicKey, toSign, signature} = req.body;

  if(!email || !publicKey || !toSign || !signature){
    return res.status(401).json('Invalid signature');
  }

  const pubK1 = getPublicKey(toSign, signature);
  if(pubK1 !== publicKey){
    return res.status(401).json('Invalid signature');
  }

  try{
    let r = await jwtVerify(toSign.slice("Signin:".length));
    if((Date.now() - (new Date(r.challange).getTime())) > 60*1000){
      return res.status(401).json('Old Challange');
    }
  }
  catch(err){
    return res.status(401).json(err.message);
  }




  // const {transaction, txid} = req.body;
  // const address = getAddress(TRANSACTION_FAMILY, txid);

  // const payload = JSON.stringify({func: 'post', args:{transaction, txid}});
  
  // try{
  //   await sendTransaction([{
  //     transactionFamily: TRANSACTION_FAMILY, 
  //     transactionFamilyVersion: TRANSACTION_FAMILY_VERSION,
  //     inputs: [address],
  //     outputs: [address],
  //     payload
  //   }]);
  //   return res.json({msg:'ok'});
  // }
  // catch(err){
  //   return res.status(500).json({err});
  // }


  var token = jwt.sign({
    publicKey 
  }, process.env.JWT_SECRET, { expiresIn: 60 * 60 });
  

  console.log('signin', req.body)
  return res.json({token});
}

module.exports.jwtMiddleware = async function(req, res, next){
  
  let token = req.get('Authorization');
  if(!token){
    return res.status(401).json('Requires JWT');
  }

  try{
    await jwtVerify(token.slice('Bearer '.length));
    next();
  }
  catch(err){
    return res.status(401).json(err.message);
  }

}
