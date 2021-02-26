require('dotenv').config()

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
let privKey1 = Buffer.from(
  "7f664d71e4200b4a2989558d1f6006d0dac9771a36a546b1a47c384ec9c4f04b", 'hex');

let privKey2 = Buffer.from(
  "2473b1f5198c4a5fa610204314c8743aa465d253fe746f5d039a29b238aa2697", 'hex');

const wallet = new ethers.Wallet(privKey2);
let pubKey = secp256k1.publicKeyConvert(Uint8Array.from(Buffer.from(wallet.publicKey.substr(2), 'hex')), true);
const publicKey = Buffer.from(pubKey).toString('hex');

console.log('privKey:', privKey2.toString('hex'));
console.log('publicKey:', publicKey);

(async () => {

  const payload = {
    type: 'todo',
    
    input: '0x3b556a88e053f97fb149cf09a020832ae2757e9fe0474c73f675f73247a5429a27582f79c76b0005a112895dc4dfaf7db68dd11a2e3c39e772c0a433b8c67c0a1b',
    output:{
      value: 'val',
      owner: publicKey
    }
  };

  let transaction = JSON.stringify(payload);
  const txid = await wallet.signMessage(transaction)

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
