require('dotenv').config()

const CryptoJS = require('crypto-js');
const axios = require('axios');

const TRANSACTION_FAMILY_NAME = process.argv[2];
const ID = process.argv[3];

console.log('TRANSACTION_FAMILY_NAME:', TRANSACTION_FAMILY_NAME);
console.log('key:', ID);

// Address scheme can be different
const getAddress = (transactionFamily, key) => {

  const sha512 = (x) =>
    CryptoJS.SHA512(x).toString(CryptoJS.enc.Hex);

  const INT_KEY_NAMESPACE = sha512(transactionFamily).substring(0, 6)
  return INT_KEY_NAMESPACE + sha512(key).slice(-64)
}

const address = getAddress(TRANSACTION_FAMILY_NAME, ID);

(async () => {
  const r = await axios.get(`${process.env.SAWTOOTH_REST}/state/${address}`);
  console.log(JSON.parse(Buffer.from(r.data.data, 'base64')));
})();
