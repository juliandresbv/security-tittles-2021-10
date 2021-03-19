const crypto = require('crypto');
const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');


const SAWTOOTH_FAMILY = 'auth';
const SAWTOOTH_PREFIX = hash512(SAWTOOTH_FAMILY).substring(0, 6);


async function transactionTransform(transaction){
  return transaction;
}

module.exports = {SAWTOOTH_FAMILY, SAWTOOTH_PREFIX, transactionTransform};