const crypto  = require('crypto');

const sha512 = (toHash, length = toHash.length) => (
  length
    ? crypto.createHash('sha512').update(toHash).digest('hex').slice(0, length)
    : crypto.createHash('sha512').update(toHash).digest('hex')
);

const enumBlockchainClients = {
  SAWTOOTH: 'sawtooth'
};

module.exports.sha512 = sha512;
module.exports.enumBlockchainClients = enumBlockchainClients;
