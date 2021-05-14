var _ = require('underscore');
var jwt = require('jsonwebtoken');
const {getPublicKey} = require('../helpers/signature');
const mongo = require('../mongodb/mongo')

const crypto = require('crypto');

const { default: axios } = require("axios");
const { json } = require('express');

if(!process.env.JWT_SECRET){
  console.log('JWT_SECRET env var not defined');
  process.exit(1);
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
    
    let r = await jwtVerify(challange);
    if((Date.now() - (new Date(r.challange).getTime())) > 60*1000){
      return res.status(401).json('Old Challange');
    }

    const authStateCollection = mongo.client().db('mydb').collection("auth_state");
    const me = await authStateCollection.findOne({_id: pubK1});

    if(!me){
      return res.status(404).json('publickey not registered');
    }

    var token = jwt.sign({
      publicKey: pubK1,
      permissions: me.value.permissions
    }, process.env.JWT_SECRET, { expiresIn: 60 * 60 });
    
    console.log('signin');
    return res.json({token});

  }
  catch(err){
    return res.status(401).json(err.message);
  }
}

module.exports.signup = async function(req, res){
  const  { transaction, txid } = req.body;
  
  try{
    const {email, challange, permissions} = JSON.parse(transaction);

    const publicKey = getPublicKey(transaction, txid);

    if(!email){
      return res.status(401).json('email is required');
    }
    
    let r = await jwtVerify(challange);
    if((Date.now() - (new Date(r.challange).getTime())) > 60*1000){
      return res.status(401).json('Old Challange');
    }

    const authStateCollection = mongo.client().db('mydb').collection("auth_state");
    const me = await authStateCollection.findOne({_id: publicKey});

    if(!me){
      console.log('new client');
    }

    const payload = { transaction, txid };

    const postTxReq = await axios.post(
      `${process.env.LEDGER_API_HOST}:${process.env.LEDGER_API_PORT}/api/transaction`,
      payload
    );


    var token = jwt.sign({
      publicKey,
      permissions: permissions
    }, process.env.JWT_SECRET, { expiresIn: 60 * 60 });
    return res.json({token});    
  }
  catch(err){
    console.log(err.message);
    return res.status(401).json(err.message);
  }
}

module.exports.whoami = async function(req, res){
  const publickey = req.auth.jwt.publicKey;

  const authStateCollection = mongo.client().db('mydb').collection("auth_state");

  const me = await authStateCollection.findOne({_id: publickey});

  if(!me){
    return res.status(404).json({msg: 'Not found'});
  }

  return res.json({publicKey: publickey, permissions: me.value.permissions, email: me.value.email});
};

module.exports.jwtMiddleware = async function(req, res, next){
  
  let token = req.get('Authorization');
  if(!token){
    return res.status(401).json('Requires JWT');
  }

  try{

    const jwt = await jwtVerify(token.slice('Bearer '.length));
    if(!_.any(jwt.permissions, p => p ==='client')){
      return res.status(401).json('JWT permission denied');
    }

    if(!req.auth){
      req.auth = {};
    }
    req.auth.jwt = jwt; 

    next();
    
  }
  catch(err){
    return res.status(401).json(err.message);
  }

}

module.exports.txMiddleware = async function(req, res, next){
  try{
    const {transaction, txid} = req.body;
    const publicKey = getPublicKey(transaction, txid);

    if(!req.auth){
      req.auth = {};
    }
    req.auth.publicKey = publicKey;
    next();
  }
  catch(err){
    return res.status(401).json({msg: 'Bad signature'});
  }
}
