const _ = require('underscore')

const {
  InvalidTransaction,
  InternalError
} = require('sawtooth-sdk/processor/exceptions')

module.exports = function(address){

  async function getRawState(context, addressRaw){
    let possibleAddressValues = await context.getState([addressRaw])
    let stateValueRep = possibleAddressValues[addressRaw]
  
    if (!stateValueRep || stateValueRep.length == 0) {
      return;
    }
    return stateValueRep;
  }
  
  async function getState(context, key){
    const rawState = await getRawState(context, address(key));
    if(_.isUndefined(rawState)){
      return;
    }
  
    let values = JSON.parse(Buffer.from(rawState, 'utf8').toString())
    if(!_.isArray(values)){
      throw new InvalidTransaction('State Error')
    }
  
    let f = _.find(values, (v) => {
      return v.key === key
    });
    if(f){
      return f.value;
    }
    return;
  }
  
  
  async function putState(context, key, value){
    const rawState = await getRawState(context, address(key));
    let toSave;
    if(_.isUndefined(rawState)){
      toSave = [{key, value}] 
    }
    else{
      let values = JSON.parse(Buffer.from(rawState, 'utf8').toString())
      if(!_.isArray(values)){
        throw new InvalidTransaction('State Error')
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
    })
  
    if(addresses.length === 0){
      throw new InternalError('State Error!')
    }
  }
  
  async function deleteState(context, key, value){
    const rawState = await getRawState(context, address(key));
    let toSave;
    if(_.isUndefined(rawState)){
      toSave = [{key, value}] 
    }
    else{
      let values = JSON.parse(Buffer.from(rawState, 'utf8').toString())
      if(!_.isArray(values)){
        throw new InvalidTransaction('State Error')
      }
      toSave = _.filter(values, (v) => {
        v.key === key;
      });
    }
  
    let addresses = await context.setState({
      [address]: Buffer.from(JSON.stringify(toSave), 'utf8')
    })
  
    if(addresses.length === 0){
      throw new InternalError('State Error!')
    }
  }

  return {
    getState,
    putState,
    deleteState
  }

}