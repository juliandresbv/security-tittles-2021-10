var _ = require('underscore');
const { ethers } = require("ethers");
const secp256k1 = require('secp256k1');
const {getPublicKey} = require('../helpers/signature');

module.exports.authTransactionMiddleware = async function(req, res, next){
  const {transaction, txid} = req.body;
  const payload = transaction;
  const signature = txid;
  try{
    const publicKey = getPublicKey(payload, signature);

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
