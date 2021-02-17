var _ = require('underscore');
const protobuf = require('sawtooth-sdk/protobuf');
const axios = require('axios');
const { ethers } = require("ethers");
const secp256k1 = require('secp256k1');
const { sendTransaction, getAddress } = require('../sawtooth/sawtooth-helpers')

module.exports.authTransactionMiddleware = async function(req, res, next){
  const {signature, payload} = req.body.transaction;

  try{
    const wrapped = "\x19Ethereum Signed Message:\n" + payload.length + payload;
    const hashSecp256 = ethers.utils.keccak256('0x' + Buffer.from(wrapped).toString('hex'));
    const pubKey = secp256k1.ecdsaRecover(
      Uint8Array.from(Buffer.from(signature.slice(2,-2), 'hex')), 
      parseInt(signature.slice(-2), 16) - 27, 
      Buffer.from(hashSecp256.slice(2), 'hex'), true);

    const publicKey = Buffer.from(pubKey).toString('hex');

    //Should make some check
    let allOk = true;

    if(!allOk){
      return res.status(401).json({msg: 'publickey does not have required permissions'});
    }
    req.auth = {publicKey};
    next();
  }
  catch(err){
    return res.status(401).json({msg: 'Bad signature'});
  }
  
}

module.exports.postTransaction = async function(req, res) {
  const {func, args} = JSON.parse(req.body.transaction.payload);
  const f = func.split('/');
  const transactionFamily = f[0];
  const transactionFamilyVersion = f[1];
  const address = getAddress(transactionFamily, args.id);

  const payload = JSON.stringify(req.body.transaction);
  
  try{
    await sendTransaction(
      transactionFamily, 
      transactionFamilyVersion,
      [address],
      [address],
      payload);
    
    return res.json({msg:'ok'});
  }
  catch(err){
    console.log(err.data);
    return res.status(500).json({err});
  }
};
