const { enumBlockchainClients } = require('./../utils/common.utils');

const { postTransactionSawtooth } = require('./sawtooth/sawtooth.client')

const postTransactionBlockchain = async (client, params) => {
  switch (client) {
    case enumBlockchainClients.SAWTOOTH:
      await postTransactionSawtooth(params);

      break;

    default:
      throw Error(`Blockchain client (${client}) not valid / not implemented`);
  }
};

module.exports.postTransactionBlockchain = postTransactionBlockchain;