'use strict'

const _ = require('underscore')
const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
//https://sawtooth.hyperledger.org/faq/transaction-processing/#my-tp-throws-an-exception-of-type-internalerror-but-the-apply-method-gets-stuck-in-an-endless-loop
//InternalErrors are transient errors, are retried, 
//InvalidTransactions are not retired
const {
  InvalidTransaction,
  InternalError
} = require('sawtooth-sdk/processor/exceptions')
const { ethers } = require("ethers");
const secp256k1 = require('secp256k1');

async function getRawState(context, addressRaw, timeout){
  let possibleAddressValues = await context.getState([addressRaw], timeout)
  let stateValueRep = possibleAddressValues[addressRaw]

  if (!stateValueRep || stateValueRep.length == 0) {
    return;
  }
  return stateValueRep;
}

async function getState(context, address, key, timeout){
  const rawState = await getRawState(context, address(key), timeout);
  if(_.isUndefined(rawState)){
    return;
  }

  let values = JSON.parse(Buffer.from(rawState, 'utf8').toString())
  if(!_.isArray(values)){
    throw new InternalError('State Error')
  }

  let f = _.find(values, (v) => {
    return v.key === key
  });
  if(f){
    return f.value;
  }
  return;
}


async function putState(context, address, key, value, timeout){
  const rawState = await getRawState(context, address(key), timeout);
  let toSave;
  if(_.isUndefined(rawState)){
    toSave = [{key, value}] 
  }
  else{
    let values = JSON.parse(Buffer.from(rawState, 'utf8').toString())
    if(!_.isArray(values)){
      throw new InternalError('State Error')
    }

    let existed = false;
    for(let n = 0; n < values.length; n++){
      if(values[n].key === key){
        values[n].value = value;
        existed = true;
        break;
      }
    }
    if(!existed){
      values.push({key, value});
    }
    toSave = values;
  }

  let addresses = await context.setState({
    [address(key)]: Buffer.from(JSON.stringify(toSave), 'utf8')
  }, timeout)

  if(addresses.length === 0){
    throw new InternalError('State Error!')
  }
}

async function deleteState(context, address, key, timeout){
  const rawState = await getRawState(context, address(key), timeout);
  if(_.isUndefined(rawState)){
    return;
  }
  
  let toSave;
  let values = JSON.parse(Buffer.from(rawState, 'utf8').toString())
  if(!_.isArray(values)){
    throw new InternalError('State Error')
  }
  toSave = _.filter(values, (v) => {
    return v.key !== key;
  });

  if(toSave.length > 0){
    let addresses = await context.setState({
      [address(key)]: Buffer.from(JSON.stringify(toSave), 'utf8')
    }, timeout)
  
    if(addresses.length === 0){
      throw new InternalError('State Error!')
    }
    return;
  }
  
  let addresses = await context.deleteState([address(key)], timeout);
  if(addresses.length === 0){
    throw new InternalError('State Error!')
  }
}

function getPublicKey(payload, signature){
  const wrapped = "\x19Ethereum Signed Message:\n" + payload.length + payload;
  const hashSecp256 = ethers.utils.keccak256('0x' + Buffer.from(wrapped).toString('hex'));
  const pubKey = secp256k1.ecdsaRecover(
    Uint8Array.from(Buffer.from(signature.slice(2,-2), 'hex')), 
    parseInt(signature.slice(-2), 16) - 27, 
    Buffer.from(hashSecp256.slice(2), 'hex'), true);

  return Buffer.from(pubKey).toString('hex');
}

module.exports = function({TP_FAMILY, TP_VERSION, TP_NAMESPACE, handlers, addresses}){

  class TPHandler extends TransactionHandler {
    constructor () {
      super(TP_FAMILY, [TP_VERSION], [TP_NAMESPACE])
    }
  
    async apply (transactionProcessRequest, context) {    
      
      const {signature, payload} = JSON.parse(Buffer.from(transactionProcessRequest.payload, 'utf8').toString());
      const {func, args} = JSON.parse(payload);
      const f = func.split('/');

      const publicKey = getPublicKey(payload, signature);

      if(f[0] !== TP_FAMILY){
        throw new InvalidTransaction('Wrong TP_FAMILY');
      }

      if(f[1] !== TP_VERSION){
        throw new InvalidTransaction('Unssuported TP Version');
      }

      if(!handlers[f[2]]){
        throw new InvalidTransaction('Function does not exist')
      }
  
      const contexts = _.map(addresses, (address) => {
        return {
          getState: function(key, timeout){
            return getState(context, address, key, timeout);
          },
          putState: function(key, value, timeout){
            return putState(context, address, key, value, timeout);
          },
          deleteState: function(key, timeout){
            return deleteState(context, address, key, timeout);
          },
          addEvent: function(){
            return context.addEvent.apply(context, [...arguments])
          },
          addReceiptData: function(){
            return context.addReceiptData.apply(context, [...arguments])
          },
          //Addition attributes just in case
          context,
          transactionProcessRequest,
          publicKey
        }
      });
      if(process.env.NODE_ENV === 'dev'){
        try{
          await handlers[f[2]](contexts, args);
        } 
        catch(e){
          //Catch InternalError and don't make the TP unavailable
          console.log(e);
        }
      }
      else{
        await handlers[f[2]](contexts, args);
      }
      

    }
  }
  return TPHandler;
};

module.exports.getState = getState;
module.exports.putState = putState;
module.exports.deleteState = deleteState;


