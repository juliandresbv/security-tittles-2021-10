require('dotenv').config()

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


let privKey;
do {
  privKey = randomBytes(32);
} while (!secp256k1.privateKeyVerify(privKey));
const wallet = new ethers.Wallet(privKey);
let pubKey = secp256k1.publicKeyConvert(Uint8Array.from(Buffer.from(wallet.publicKey.substr(2), 'hex')), true);
const publicKey = Buffer.from(pubKey).toString('hex');


(async () => {

  const payload = {
    type: 'todo',
    id: 10,
    
    input: null,
    output:{
      value: "val",
      owner: publicKey
    }
  };

  let transaction = JSON.stringify(payload);
  const txid = await wallet.signMessage(transaction)

  const pl = JSON.stringify({func: 'post', args:{transaction, txid}});
  const address = getAddress(TRANSACTION_FAMILY, txid);

  try{
    await sendTransaction(
      TRANSACTION_FAMILY, 
      TRANSACTION_FAMILY_VERSION,
      [address],
      [address],
      pl);
    
    console.log('ok');
  }
  catch(err){
    console.log(err);
  }
})();
