require('dotenv').config()

const _ = require('underscore');
const { ethers } = require("ethers");
const {getAddress, sendTransaction} = require('../sawtooth/sawtooth-helpers');
const secp256k1 = require('secp256k1')
const { randomBytes } = require('crypto');
const crypto = require('crypto');
const { default: axios } = require("axios");

const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const TRANSACTION_FAMILY = 'todos';
const TRANSACTION_FAMILY_VERSION = '1.0';
const INT_KEY_NAMESPACE = hash512(TRANSACTION_FAMILY).substring(0, 6)

// let privKey;
// do {
//   privKey = randomBytes(32);
// } while (!secp256k1.privateKeyVerify(privKey));

// const wallet = new ethers.Wallet(privKey);
// let pubKey = secp256k1.publicKeyConvert(Uint8Array.from(Buffer.from(wallet.publicKey.substr(2), 'hex')), true);
// const publicKey = Buffer.from(pubKey).toString('hex');
// console.log(privKey.toString('hex'))
// console.log(publicKey)
// return;

let privKey;

if(process.argv[2] == 1){
  privKey = Buffer.from(
    "7f664d71e4200b4a2989558d1f6006d0dac9771a36a546b1a47c384ec9c4f04b", 'hex');
}
else if(! _.isUndefined(process.argv[2])){
  privKey = Buffer.from(
    "0e9fe89bebe111af51d8204b4e4e627764564aa003b7477f266f4f86e37179f3", 'hex');
}
else{
  console.log('Use:');
  console.log('node ./scripts/post.js 1 message');
  return;
}

let message = "default message";
if(process.argv[3]){
  message = process.argv[3];
}


const wallet = new ethers.Wallet(privKey);
let pubKey = secp256k1.publicKeyConvert(Uint8Array.from(Buffer.from(wallet.publicKey.substr(2), 'hex')), true);
const publicKey = Buffer.from(pubKey).toString('hex');

(async () => {

  const payload1 = {
    type: 'todo',
    id: 10,
    
    input: null,
    output:{
      value: message + "3",
      owner: publicKey
    }
  };
  const payload2 = {
    type: 'todo',
    id: 10,
    
    input: null,
    output:{
      value: message,
      owner: publicKey
    }
  };

  let transaction1 = JSON.stringify(payload1);
  const txid1 = await wallet.signMessage(transaction1);



  try{
    // let res = await axios.get('http://localhost:3001/api/');

    let res = await axios.post('http://localhost:3001/api/', {transaction: transaction1, txid: txid1});
    console.log(res.data);
    console.log(txid1)
  }
  catch(err){
    console.log(err);
  }
})();
