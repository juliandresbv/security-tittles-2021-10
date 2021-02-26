require('dotenv').config()

var _ = require('underscore');
const { ethers } = require("ethers");
const {getAddress, sendTransaction, sendTransactionWithAwait} = require('../sawtooth/sawtooth-helpers');
const secp256k1 = require('secp256k1')
const { randomBytes } = require('crypto');
const crypto = require('crypto');
const { default: axios } = require("axios");

const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const TRANSACTION_FAMILY = 'todos';
const TRANSACTION_FAMILY_VERSION = '1.0';
const INT_KEY_NAMESPACE = hash512(TRANSACTION_FAMILY).substring(0, 6)


// let privKey1;
// do {
//   privKey1 = randomBytes(32);
// } while (!secp256k1.privateKeyVerify(privKey));

let privKey1;
let privKey2;

if(process.argv[2] == 1){
  privKey1 = Buffer.from(
    "7f664d71e4200b4a2989558d1f6006d0dac9771a36a546b1a47c384ec9c4f04b", 'hex');
  privKey2 = Buffer.from(
    "0e9fe89bebe111af51d8204b4e4e627764564aa003b7477f266f4f86e37179f3", 'hex');
    
}
else if(! _.isUndefined(process.argv[2])){
  privKey1 = Buffer.from(
    "0e9fe89bebe111af51d8204b4e4e627764564aa003b7477f266f4f86e37179f3", 'hex');
  privKey2 = Buffer.from(
    "7f664d71e4200b4a2989558d1f6006d0dac9771a36a546b1a47c384ec9c4f04b", 'hex');
}

let transactionId;
if(process.argv[3]){
  transactionId = process.argv[3];
}
else{
  console.log('Use:');
  console.log('node ./scripts/post.js 1 0xhashoftransaction');
  return;
}


const wallet1 = new ethers.Wallet(privKey1);
let pubKey1 = secp256k1.publicKeyConvert(Uint8Array.from(Buffer.from(wallet1.publicKey.substr(2), 'hex')), true);
const publicKey1 = Buffer.from(pubKey1).toString('hex');

const wallet2 = new ethers.Wallet(privKey2);
let pubKey2 = secp256k1.publicKeyConvert(Uint8Array.from(Buffer.from(wallet2.publicKey.substr(2), 'hex')), true);
const publicKey2 = Buffer.from(pubKey2).toString('hex');

(async () => {

  const payload = {
    type: 'todo',
    
    input: transactionId,
    output:{
      value: 'new value',
      owner: publicKey2
    }
  };

  let transaction = JSON.stringify(payload);
  const txid = await wallet1.signMessage(transaction)

  const input = getAddress(TRANSACTION_FAMILY, JSON.parse(transaction).input);
  const address = getAddress(TRANSACTION_FAMILY, txid);

  const pl = JSON.stringify({func: 'put', args:{transaction, txid}});
  
  try{
    await sendTransactionWithAwait(
      TRANSACTION_FAMILY, 
      TRANSACTION_FAMILY_VERSION,
      [input, address],
      [input, address],
      pl);
    console.log('ok');
  }
  catch(err){
    let errMsg;
    if(err.data){
      errMsg = err.data;
      if(err.message == 'Invalid transaction'){
        errMsg = "Invalid Transaction: " + err.data.data[0].invalid_transactions[0].message;
      }
      else {
        errMsg = err;
      }
    }
    else{
      errMsg = err;
    }
    console.log(errMsg);
  }

})();
