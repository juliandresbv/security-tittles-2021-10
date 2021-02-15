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

module.exports = function({TP_FAMILY, TP_VERSION, TP_NAMESPACE, handlers, addresses}){

  class TPHandler extends TransactionHandler {
    constructor () {
      super(TP_FAMILY, [TP_VERSION], [TP_NAMESPACE])
    }
  
    async apply (transactionProcessRequest, context) {    
      
      let payload = JSON.parse(Buffer.from(transactionProcessRequest.payload, 'utf8').toString());   
      const {func, params} = payload;
  
      if(!handlers[func]){
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
          transactionProcessRequest
        }
      });
      if(process.env.NODE_ENV === 'dev'){
        try{
          await handlers[func](contexts, params);
        } 
        catch(e){
          //Catch InternalError and don't make the TP unavailable
          console.log(e);
        }
      }
      else{
        await handlers[func](contexts, params);
      }
      

    }
  }
  return TPHandler;
};

module.exports.getState = getState;
module.exports.putState = putState;
module.exports.deleteState = deleteState;


