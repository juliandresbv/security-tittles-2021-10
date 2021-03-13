const { ethers } = require("ethers");
const secp256k1 = require('secp256k1');


module.exports.buildTransaction = async function (payload, privKey){
  const wallet = new ethers.Wallet(privKey);
  let transaction = JSON.stringify(payload);
  const txid = await wallet.signMessage(transaction);
  return {transaction, txid}
}

module.exports.getPublicKey = function (privKey){
  const wallet = new ethers.Wallet(privKey);
  let pubKey = secp256k1.publicKeyConvert(Uint8Array.from(Buffer.from(wallet.publicKey.substr(2), 'hex')), true);
  return Buffer.from(pubKey).toString('hex');
}

module.exports.privKey1 = Buffer.from(
  "7f664d71e4200b4a2989558d1f6006d0dac9771a36a546b1a47c384ec9c4f04b", 'hex');

module.exports.privKey2 = Buffer.from(
  "0e9fe89bebe111af51d8204b4e4e627764564aa003b7477f266f4f86e37179f3", 'hex');


module.exports.sleep = function(ms){
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}