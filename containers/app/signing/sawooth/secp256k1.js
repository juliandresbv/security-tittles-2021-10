require('dotenv').config()

// https://sawtooth.hyperledger.org/docs/core/releases/1.2.6/_autogen/sdk_submit_tutorial_js.html
// https://sawtooth.hyperledger.org/docs/core/releases/1.2.6/_autogen/txn_submit_tutorial.html

const secp256k1 = require('secp256k1');
const crypto = require('crypto');
const {protobuf} = require('sawtooth-sdk')

const axios = require('axios');


const ID = "5";
const VALUE = "hi";

// let privateKey;
// do {
//   privateKey = randomBytes(32);
// } while (!secp256k1.privateKeyVerify(privateKey));

let privateKey = Buffer.from(
  "0x7f664d71e4200b4a2989558d1f6006d0dac9771a36a546b1a47c384ec9c4f04b".slice(2), 'hex');

const publicKey = secp256k1.publicKeyCreate(privateKey);

const sha512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex')

const sha256 = (x) =>
  crypto.createHash('sha256').update(x).digest('hex')

// Address scheme can be different
const getAddress = (transactionFamily, varName) => {
  const INT_KEY_NAMESPACE = sha512(transactionFamily).substring(0, 6)
  return INT_KEY_NAMESPACE + sha512(varName).slice(-64)
}

const TRANSACTION_FAMILY_NAME = 'intkey';
const TRANSACTION_FAMILY_VERSION = '1.0';


const payload = {
  func: "put",
  params: {id: ID, value: VALUE}
};

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
  nonce: "nonce"//crypto.randomBytes(32).toString('hex')
}).finish()

// console.log('>:', transactionHeaderBytes.toString('base64'))

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


console.log(Buffer.from(batchListBytes).toString('base64'));  


let params = {
  headers: {'Content-Type': 'application/octet-stream'}
};


// batchListBytes = Buffer.from('CrkHCscBCkIwMjRhNjkzMjBkM2RhOWRkMzNlMWRlZmE1ZTgwNzhkZjAxOWIxNGJmMTE2ODRlOTYzODg5YjFkZDhhMDBjOTkxYTcSgAEzMzFiYjk4YTk5NmNlMTAxMmRlNzMzOGM0MTdkOWU0NjFjNjFmNjFmOTJlYzBhYjNhMDFkZDhiYmMwYzNmYTMyNWZhYjUwYjYzYmNlMzAyMzAxNzI3ZmNmMmNhODg3MWY1NDc1YjZkZDFiYzc0OTFmOWJlMDBiNzdmOWM3ZDkwZhKAATM1MTdjMmQ3MzJmNTZkMTk2ZThhNGQwMDk4ZGJkZWY0YzVmNGE4ZmUwZTIzZTA2NjFlYTAzNDUyYzVlNDY2NWQ2OTZkYTNiZmMzNTMzZmEzMzk5MzdlZmE2OTEyODkzMzBhODNkOTQyZmQzNDg1NTllNzE1YjA5NDk5MWQ0NWNmGukECq8DCkIwMjRhNjkzMjBkM2RhOWRkMzNlMWRlZmE1ZTgwNzhkZjAxOWIxNGJmMTE2ODRlOTYzODg5YjFkZDhhMDBjOTkxYTcaBmludGtleSIDMS4wKkYxY2YxMjZmNDUxN2JkYTRhNjk1ZjAyZDBhNzNkZDRkYjU0M2I0NjUzZGYyOGY1ZDA5ZGFiODZmOTJmZmI5Yjg2ZDAxZTI1MgVub25jZTpGMWNmMTI2ZjQ1MTdiZGE0YTY5NWYwMmQwYTczZGQ0ZGI1NDNiNDY1M2RmMjhmNWQwOWRhYjg2ZjkyZmZiOWI4NmQwMWUyNUqAATJiYjEzZWM2NTI3MTdjZTA2OWE2NzBmYTU4YzEwZDU1MWI2YTNkYzBmNTU5NTg4Nzk3YmUwN2Y2OGIzOTM1MDI4YWFlYWY2YmJhMWFjNjk0N2JiOTQzODYwMzM3MTc5NmI1NjZlZjQ0M2MxZjY4NmYzNzU0MzY0OTM2NTdjZDc2UkIwMjRhNjkzMjBkM2RhOWRkMzNlMWRlZmE1ZTgwNzhkZjAxOWIxNGJmMTE2ODRlOTYzODg5YjFkZDhhMDBjOTkxYTcSgAEzMzFiYjk4YTk5NmNlMTAxMmRlNzMzOGM0MTdkOWU0NjFjNjFmNjFmOTJlYzBhYjNhMDFkZDhiYmMwYzNmYTMyNWZhYjUwYjYzYmNlMzAyMzAxNzI3ZmNmMmNhODg3MWY1NDc1YjZkZDFiYzc0OTFmOWJlMDBiNzdmOWM3ZDkwZhoyeyJmdW5jIjoicHV0IiwicGFyYW1zIjp7ImlkIjoiNSIsInZhbHVlIjoiSEVMTE8ifX0=',
//   'base64');

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

  r = await axios.get(`${process.env.SAWTOOTH_REST}/state/${address}`);
  console.log(JSON.parse(Buffer.from(r.data.data, 'base64')));
})();


  


