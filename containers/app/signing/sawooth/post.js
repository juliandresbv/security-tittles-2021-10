require('dotenv').config()

// https://sawtooth.hyperledger.org/docs/core/releases/1.2.6/_autogen/sdk_submit_tutorial_js.html
// https://sawtooth.hyperledger.org/docs/core/releases/1.2.6/_autogen/txn_submit_tutorial.html
const secp256k1 = require('secp256k1');
const {protobuf} = require('sawtooth-sdk');
const CryptoJS = require('crypto-js');
const axios = require('axios');

const TRANSACTION_FAMILY_NAME = process.argv[2];

const ID = process.argv[3];
const payload = JSON.parse(process.argv[4]);

const TRANSACTION_FAMILY_VERSION = '1.0';

console.log('TRANSACTION_FAMILY_NAME:', TRANSACTION_FAMILY_NAME);
console.log('key:', ID);
console.log('payload:', payload);

// let privateKey;
// do {
//   privateKey = randomBytes(32);
// } while (!secp256k1.privateKeyVerify(privateKey));

let privateKey = Buffer.from(
  "0x7f664d71e4200b4a2989558d1f6006d0dac9771a36a546b1a47c384ec9c4f04b".slice(2), 'hex');

const publicKey = secp256k1.publicKeyCreate(privateKey);

// https://stackoverflow.com/questions/33914764/how-to-read-a-binary-file-with-filereader-in-order-to-hash-it-with-sha-256-in-cr
function arrayBufferToWordArray(ab) {
  var i8a = new Uint8Array(ab);
  var a = [];
  for (var i = 0; i < i8a.length; i += 4) {
    a.push(i8a[i] << 24 | i8a[i + 1] << 16 | i8a[i + 2] << 8 | i8a[i + 3]);
  }
  return CryptoJS.lib.WordArray.create(a, i8a.length);
}

const sha512 = (x) =>
  CryptoJS.SHA512(arrayBufferToWordArray(x)).toString(CryptoJS.enc.Hex);

const sha256 = (x) =>
  CryptoJS.SHA256(arrayBufferToWordArray(x)).toString(CryptoJS.enc.Hex);

const randomBytes = (num) => 
  CryptoJS.lib.WordArray.random(num).toString(CryptoJS.enc.Hex);

// Address scheme can be different
const getAddress = (transactionFamily, key) => {

  const sha512 = (x) =>
    CryptoJS.SHA512(x).toString(CryptoJS.enc.Hex);

  const INT_KEY_NAMESPACE = sha512(transactionFamily).substring(0, 6)
  return INT_KEY_NAMESPACE + sha512(key).slice(-64)
}

const address = getAddress(TRANSACTION_FAMILY_NAME, ID);

const payloadBytes = Buffer.from(JSON.stringify(payload), 'utf8')

const transactionHeaderBytes = protobuf.TransactionHeader.encode({
  familyName: TRANSACTION_FAMILY_NAME,
  familyVersion: TRANSACTION_FAMILY_VERSION,
  inputs: [address],
  outputs: [address],
  signerPublicKey: Buffer.from(publicKey).toString('hex'),
  // In this example, we're signing the batch with the same private key,
  // but the batch can be signed by another party, in which case, the
  // public key will need to be associated with that key.
  batcherPublicKey: Buffer.from(publicKey).toString('hex'),
  // In this example, there are no dependencies.  This list should include
  // an previous transaction header signatures that must be applied for
  // this transaction to successfully commit.
  // For example,
  // dependencies: ['540a6803971d1880ec73a96cb97815a95d374cbad5d865925e5aa0432fcf1931539afe10310c122c5eaae15df61236079abbf4f258889359c4d175516934484a'],
  dependencies: [],
  payloadSha512: sha512(payloadBytes),
  nonce: randomBytes(32)
}).finish()

const hashHeader = sha256(transactionHeaderBytes);

let signature = Buffer.from(
  secp256k1.ecdsaSign(
    Uint8Array.from(Buffer.from(hashHeader, 'hex')),
    Uint8Array.from(privateKey)
  ).signature
).toString('hex');

const transaction = protobuf.Transaction.create({
  header: transactionHeaderBytes,
  headerSignature: signature,
  payload: payloadBytes
})

//--------------------------------------
//Optional
//If sending to sign outside

const txnListBytes = protobuf.TransactionList.encode({transactions:[
  transaction
]}).finish()

//const txnBytes2 = transaction.finish()

let transactions = protobuf.TransactionList.decode(txnListBytes).transactions;

//----------------------------------------

//transactions = [transaction]

const batchHeaderBytes = protobuf.BatchHeader.encode({
  signerPublicKey: Buffer.from(publicKey).toString('hex'),
  transactionIds: transactions.map((txn) => txn.headerSignature),
}).finish()

const batchHashHeader = sha256(batchHeaderBytes);

signature = Buffer.from(
  secp256k1.ecdsaSign(
    Uint8Array.from(Buffer.from(batchHashHeader, 'hex')),
    Uint8Array.from(privateKey)
  ).signature
).toString('hex');

const batch = protobuf.Batch.create({
  header: batchHeaderBytes,
  headerSignature: signature,
  transactions: transactions
})

let batchListBytes = protobuf.BatchList.encode({
  batches: [batch]
}).finish();

// console.log(Buffer.from(batchListBytes).toString('base64'));  

let params = {
  headers: {'Content-Type': 'application/octet-stream'}
};

(async () => {
  let r = await axios.post(`${process.env.SAWTOOTH_REST}/batches`, batchListBytes, params)

  let batchStatusLink = r.data.link;

  await new Promise((resolve) =>{
    setTimeout(()=>{
      resolve();
    }, 2000);
  });

  r = await axios.get(batchStatusLink);
  console.log(r.data);

  console.log(`${process.env.SAWTOOTH_REST}/state/${address}`);
  r = await axios.get(`${process.env.SAWTOOTH_REST}/state/${address}`);
  console.log(JSON.parse(Buffer.from(r.data.data, 'base64')));
})();
