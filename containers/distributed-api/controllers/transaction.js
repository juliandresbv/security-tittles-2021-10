var _ = require('underscore');
var jwt = require('jsonwebtoken');
const {getPublicKey} = require('../helpers/signature');
const mongo = require('../mongodb/mongo')

const crypto = require('crypto');
const { 
  sendTransaction, 
  getAddress, 
  sendTransactionWithAwait, 
  queryState 
} = require('../sawtooth/sawtooth-helpers');

const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const TRANSACTION_FAMILY_VERSION = '1.0';
const INT_KEY_NAMESPACE = (txFamily) => hash512(txFamily).substring(0, 6)

const { default: axios } = require("axios");
const { json } = require('express');

function buildAddress(transactionFamily){
  return (key) => {
    return getAddress(transactionFamily, key);
  }
}

if(!process.env.JWT_SECRET){
  console.log('JWT_SECRET env var not defined');
  process.exit(1);
}

function getFamilyFromType(payload) {
  let {
    type
  } = payload;

  return type.split('/')[0];
}

module.exports.postTransaction = async function(req, res){
  // return res.json('Hello');


  const { transaction, txid } = req.body;
  
  try{
    const {email, challange, permissions} = JSON.parse(transaction);
    const parsedTx = JSON.parse(transaction);
    let {
      type
    } = parsedTx;

    const TRANSACTION_FAMILY = getFamilyFromType(parsedTx);
    
    console.log(parsedTx);
    
    // return res.json('Hello');
    
    if (type == 'auth/signup') {
      const publicKey = getPublicKey(transaction, txid);
    
      const address = getAddress(TRANSACTION_FAMILY, publicKey);
      const payload = JSON.stringify({func: 'put', args:{transaction, txid}});

      await sendTransactionWithAwait([{
        transactionFamily: TRANSACTION_FAMILY, 
        transactionFamilyVersion: TRANSACTION_FAMILY_VERSION,
        inputs: [address],
        outputs: [address],
        payload
      }]);    
    } else if (type == 'todo') {
      const payload = JSON.stringify({func: 'post', args:{transaction, txid}});
      const address = getAddress(TRANSACTION_FAMILY, txid);
  
      try{
        await sendTransactionWithAwait([{
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
    }

    return res.send('ok');
  }
  catch(err){
    console.log(err.message);
    return res.status(401).json(err.message);
  }
}
