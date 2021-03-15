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
  const  {transaction, txid} = req.body;

  try{
    const {challange} = JSON.parse(transaction);

    const pubK1 = getPublicKey(transaction, txid);

    // if(pubK1 !== publicKey){
    //   return res.status(401).json('Invalid signature');
    // }
    
    let r = await jwtVerify(challange);
    if((Date.now() - (new Date(r.challange).getTime())) > 60*1000){
      return res.status(401).json('Old Challange');
    }

    var token = jwt.sign({
      publicKey: pubK1
    }, process.env.JWT_SECRET, { expiresIn: 60 * 60 });
    
  
    console.log('signin')
    return res.json({token});

  }
  catch(err){
    return res.status(401).json(err.message);
  }
}

module.exports.signup = async function(req, res){
  const  {transaction, txid} = req.body;
  try{
    const {email, publicKey, challange} = JSON.parse(transaction);

    const pubK1 = getPublicKey(transaction, txid);

    if(pubK1 !== publicKey){
      return res.status(401).json('Invalid signature');
    }

    if(!email){
      return res.status(401).json('email is required');
    }
    
    let r = await jwtVerify(challange);
    if((Date.now() - (new Date(r.challange).getTime())) > 60*1000){
      return res.status(401).json('Old Challange');
    }

    var token = jwt.sign({
      publicKey 
    }, process.env.JWT_SECRET, { expiresIn: 60 * 60 });
    
  
    console.log('signup')
    return res.json({token});

  }
  catch(err){
    return res.status(401).json(err.message);
  }
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