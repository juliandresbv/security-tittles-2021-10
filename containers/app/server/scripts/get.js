require('dotenv').config()

var _ = require('underscore');
const { ethers } = require("ethers");
const {getAddress, sendTransaction} = require('../sawtooth/sawtooth-helpers');
const secp256k1 = require('secp256k1')
const { randomBytes } = require('crypto');
const crypto = require('crypto');
const { default: axios } = require("axios");

const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const TRANSACTION_FAMILY = 'todo';
const TRANSACTION_FAMILY_VERSION = '1.0';
const INT_KEY_NAMESPACE = hash512(TRANSACTION_FAMILY).substring(0, 6);


(async () => {

  let params = {
    headers: {'Content-Type': 'application/json'}
  };

  let query = await axios.get(`${process.env.SAWTOOTH_REST}/state?address=${INT_KEY_NAMESPACE}&limit=${20}`, params);
  let allTodos = _.chain(query.data.data)
    .map((d) => {
      return {
        address: d.address,
        data: JSON.parse(Buffer.from(d.data, 'base64'))
      }
    })
    .flatten()
    // .map(d => d.value)
    .value();

  console.dir(allTodos, {depth: null, colors: true})

})();
