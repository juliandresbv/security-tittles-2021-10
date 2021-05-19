const httpStatus = require('http-status');
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1');
const { Signer, createContext } = require('sawtooth-sdk/signing');

const { sha512 } = require('./../utils/common.utils');
const { postTransactionBlockchain } = require('./../blockchain-client/index');


//  Constants
const FAMILY_VERSION = '1.0.0';
const PRIV_KEY = Secp256k1PrivateKey
  .fromHex('cf1c542239491eccb006d19d5d29439375c99567dd1e36e22fed162a2385d5be');
const SIGNER = new Signer(createContext('secp256k1'), PRIV_KEY);
const PUB_KEY_HEX = SIGNER.getPublicKey().asHex();

/*
 * Business Controller: Exportable functions
 */

/**
 *
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const postTransaction = async (req, res) => {
  try {
    let {
      body,
      body: {
        config: {
          context,
          subcontexts,
          blockchainPlatform,
        },
        model: {
          subjects: {
            major,
            minor
          },
          predicates,
          predicates: {
            object
          }
        }
      } = {  }
    } = req;

    let subcontext = subcontexts.join('/');

    let familyName = `${context}/${subcontext}`;
    let payload = { func: 'post', args: { ...body } };

    let params = { familyName, payload };

    console.log(params)

    await postTransactionBlockchain('sawtooth', params);

    return res.status(httpStatus.OK).send({ data: 'OK' });
  } catch (error) {
    console.log(error);

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ data: error });
  }
}

const getAllStates = async () => {

}

module.exports.postTransaction = postTransaction;