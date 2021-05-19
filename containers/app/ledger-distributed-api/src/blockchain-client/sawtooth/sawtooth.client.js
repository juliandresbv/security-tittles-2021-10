const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1');
const { Signer, createContext } = require('sawtooth-sdk/signing');
const { protobuf } = require('sawtooth-sdk');
const axios = require('axios').default;

const { sha512 } = require("../../utils/common.utils");

const FAMILY_VERSION = '1.0.0';
const PRIV_KEY = Secp256k1PrivateKey
  .fromHex('cf1c542239491eccb006d19d5d29439375c99567dd1e36e22fed162a2385d5be');
const SIGNER = new Signer(createContext('secp256k1'), PRIV_KEY);
const PUB_KEY_HEX = SIGNER.getPublicKey().asHex();

/*
 * Private functions
 */

/**
 *
 * @param params:
 * - familyName
 * - payload
 * @returns {*}
 */
function buildTransactionsBatchList(params) {
  let {
    familyName,
    payload
  } = params;

  let familyNameAddressPrefix = sha512(familyName, 6);
  let payloadBytes = Buffer.from(JSON.stringify(payload));

  let transactionHeaderBytes = protobuf.TransactionHeader.encode({
    batcherPublicKey: PUB_KEY_HEX,
    // dependencies: [],
    familyName: familyName,
    familyVersion: FAMILY_VERSION,
    inputs: [familyNameAddressPrefix],
    // nonce: uuidV4(),
    outputs: [familyNameAddressPrefix],
    payloadSha512: sha512(payloadBytes),
    signerPublicKey: PUB_KEY_HEX,
  }).finish();

  let transaction = protobuf.Transaction.create({
    header: transactionHeaderBytes,
    headerSignature: SIGNER.sign(Buffer.from(transactionHeaderBytes)),
    payload: payloadBytes,
  });

  let batchHeaderBytes = protobuf.BatchHeader.encode({
    signerPublicKey: PUB_KEY_HEX,
    transactionIds: [transaction.headerSignature],
  }).finish();

  let batch = protobuf.Batch.create({
    header: batchHeaderBytes,
    headerSignature: SIGNER.sign(Buffer.from(batchHeaderBytes)),
    transactions: [transaction],
    trace: true,
  });

  let batchListBytes = protobuf.BatchList.encode({
    batches: [batch]
  }).finish();

  return batchListBytes;
}

/*
 * Exportable functions
 */

/**
 *
 * @param params
 * @returns {Promise<void>}
 */
const postTransactionSawtooth = async (params) => {
  let batchListBytes = buildTransactionsBatchList(params);

  await axios.post(
    `http://localhost:8008/batches`,
    batchListBytes,
    {
      headers: {
        'content-type': 'application/octet-stream'
      }
    }
  )
}

module.exports.postTransactionSawtooth = postTransactionSawtooth;
