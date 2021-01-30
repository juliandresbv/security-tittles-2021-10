//https://www.npmjs.com/package/secp256k1
//https://github.com/cryptocoinjs/secp256k1-node/blob/master/API.md

const secp256k1 = require('secp256k1')
const CryptoJS = require('crypto-js')

const msg = Buffer.from(CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex), 'hex');
 
// generate privKey
let privKey
do {
  privKey = Buffer.from(CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex), 'hex');
} while (!secp256k1.privateKeyVerify(privKey))
 
// get the public key in a compressed format
const pubKey = secp256k1.publicKeyCreate(privKey)
 
// sign the message
const sigObj = secp256k1.ecdsaSign(msg, privKey)
 
// verify the signature
console.log(secp256k1.ecdsaVerify(sigObj.signature, msg, pubKey))

console.log('pub:', Buffer.from(pubKey).toString('hex'))
console.log('priv:', privKey.toString('hex'))

const pubKeyRecovered = secp256k1.ecdsaRecover(sigObj.signature, sigObj.recid, msg, true);

console.log('pubKeyRecovered:', Buffer.from(pubKeyRecovered).toString('hex'));

console.log('pubKey and pubKeyRecovered are the same?');
console.log(Buffer.from(pubKey).toString('hex') === Buffer.from(pubKeyRecovered).toString('hex'));
