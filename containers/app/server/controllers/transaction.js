var _ = require('underscore');
const { ethers } = require("ethers");
const secp256k1 = require('secp256k1');
const { sendTransaction, getAddress } = require('../sawtooth/sawtooth-helpers')

module.exports.authTransactionMiddleware = async function(req, res, next){
  const {transaction, txid} = req.body;
  const payload = transaction;
  const signature = txid;
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
    console.log(err);
    return res.status(401).json({msg: 'Bad signature'});
  }
  
}

module.exports.postTransaction = async function(req, res) {
  const {transaction, txid} = req.body;
  const transactionFamily = 'todos';
  const transactionFamilyVersion = '1.0';
  const address = getAddress(transactionFamily, txid);

  const payload = JSON.stringify({func: 'post', args:{transaction, txid}});
  
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

module.exports.putTransaction = async function(req, res) {
  const {transaction, txid} = req.body;
  const transactionFamily = 'todos';
  const transactionFamilyVersion = '1.0';

  const input = getAddress(transactionFamily, JSON.parse(transaction).input);
  const address = getAddress(transactionFamily, txid);

  const payload = JSON.stringify({func: 'put', args:{transaction, txid}});
  
  try{
    await sendTransaction(
      transactionFamily, 
      transactionFamilyVersion,
      [input, address],
      [input, address],
      payload);
    
    return res.json({msg:'ok'});
  }
  catch(err){
    console.log(err.data);
    return res.status(500).json({err});
  }
};
