import CryptoJS from 'crypto-js'
import secp256k1 from 'secp256k1'
import protobuf from 'sawtooth-sdk/protobuf'
import { selectPublicKey } from '../redux/authSlice'

let store;

export function init(_store){
  store = _store;
}

export async function getCurrentAccount() {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  return accounts[0];
}

export async function getPublicKey() {

  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  const from = accounts[0];

  var msgHash = Buffer.from('8144a6fa26be252b86456491fbcd43c1de7e022241845ffea1c3df066f7cfede', 'hex');  

  await sleep(100);
  let signature1 = await window.ethereum.request({
    method: 'eth_sign',
    params: [from, msgHash]
  });

  let publicKey = Buffer.from(secp256k1.ecdsaRecover(
    Uint8Array.from(Buffer.from(signature1.slice(2,-2), 'hex')), 
    parseInt(signature1.slice(-2), 16) - 27, 
    Uint8Array.from(msgHash), true))
    .toString('hex');

  return publicKey;
}


const hash = (x) =>
  CryptoJS.SHA512(x).toString(CryptoJS.enc.Hex)

// https://stackoverflow.com/questions/33914764/how-to-read-a-binary-file-with-filereader-in-order-to-hash-it-with-sha-256-in-cr
function arrayBufferToWordArray(ab) {
  var i8a = new Uint8Array(ab);
  var a = [];
  for (var i = 0; i < i8a.length; i += 4) {
    a.push(i8a[i] << 24 | i8a[i + 1] << 16 | i8a[i + 2] << 8 | i8a[i + 3]);
  }
  return CryptoJS.lib.WordArray.create(a, i8a.length);
}

const sha512 = (someBytes) =>
  CryptoJS.SHA512(arrayBufferToWordArray(someBytes)).toString(CryptoJS.enc.Hex)

const sha256 = (someBytes) => 
  CryptoJS.SHA256(arrayBufferToWordArray(someBytes)).toString(CryptoJS.enc.Hex);

const randomBytes = (num) => 
  CryptoJS.lib.WordArray.random(num).toString(CryptoJS.enc.Hex);

function getAddress(transactionFamily, key){
  const familyNamespace = hash(transactionFamily).substring(0, 6);
  return familyNamespace + hash(key).slice(-64);
}

export function buildAddress(transactionFamily){
  return (key) => {
    return getAddress(transactionFamily, key);
  }
}

export async function buildBatch(
  transactionFamily, 
  transactionFamilyVersion,
  inputs,
  outputs,
  payload
){
  const publickKey = selectPublicKey(store.getState());
  return _buildBatch(publickKey, 
    transactionFamily, 
    transactionFamilyVersion,
    inputs,
    outputs,
    payload);
}

async function _buildBatch(
  publicKey,
  transactionFamily, 
  transactionFamilyVersion,
  inputs,
  outputs,
  payload
)
{
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  const from = accounts[0];

  const payloadBytes = Buffer.from(JSON.stringify(payload), 'utf8')

  const transactionHeaderBytes = protobuf.TransactionHeader.encode({
    familyName: transactionFamily,
    familyVersion: transactionFamilyVersion,
    inputs: inputs,
    outputs: outputs,
    signerPublicKey: publicKey,
    // In this example, we're signing the batch with the same private key,
    // but the batch can be signed by another party, in which case, the
    // public key will need to be associated with that key.
    batcherPublicKey: publicKey,
    // In this example, there are no dependencies.  This list should include
    // an previous transaction header signatures that must be applied for
    // this transaction to successfully commit.
    // For example,
    // dependencies: ['540a6803971d1880ec73a96cb97815a95d374cbad5d865925e5aa0432fcf1931539afe10310c122c5eaae15df61236079abbf4f258889359c4d175516934484a'],
    dependencies: [],
    payloadSha512: sha512(payloadBytes),
    nonce: randomBytes(32)
  }).finish()


  let transactionHeaderHash = Uint8Array.from(Buffer.from(
    sha256(transactionHeaderBytes), 
    'hex'));

  await sleep(100);
  let signature = await window.ethereum.request({
    method: 'eth_sign',
    params: [from, transactionHeaderHash]
  });

  signature = signature.slice(2, -2)

  const transaction = protobuf.Transaction.create({
    header: transactionHeaderBytes,
    headerSignature: signature,
    payload: payloadBytes
  })

  //--------------------------------------
  //Optional
  //If sending to sign outside
  
  // const txnListBytes = protobuf.TransactionList.encode({transactions:[
  //   transaction
  // ]}).finish()
  
  //const txnBytes2 = transaction.finish()
  
  // let transactions = protobuf.TransactionList.decode(txnListBytes).transactions;
  
  //----------------------------------------
  
  let transactions = [transaction]
  
  const batchHeaderBytes = protobuf.BatchHeader.encode({
    signerPublicKey: publicKey,
    transactionIds: transactions.map((txn) => txn.headerSignature),
  }).finish()
  
  let batchHeaderHash = Uint8Array.from(Buffer.from(
    sha256(batchHeaderBytes), 
    'hex'));

  await sleep(100);
  signature = await window.ethereum.request({
    method: 'eth_sign',
    params: [from, batchHeaderHash]
  });
  signature = signature.slice(2, -2)


  const batch = protobuf.Batch.create({
    header: batchHeaderBytes,
    headerSignature: signature,
    transactions: transactions
  })
  
  const batchListBytes = protobuf.BatchList.encode({
    batches: [batch]
  }).finish()
  
  return Buffer.from(batchListBytes).toString('base64');
}


function sleep(time){
  return new Promise((resolve) => {
    setTimeout(()=>{
      resolve();
    }, time);
  });
}