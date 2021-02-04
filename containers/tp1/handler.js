/**
 * Copyright 2016 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ------------------------------------------------------------------------------
 */

'use strict'

const _ = require('underscore')

const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
const {
  InvalidTransaction,
  InternalError
} = require('sawtooth-sdk/processor/exceptions')

const crypto = require('crypto')

const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const INT_KEY_FAMILY = 'intkey'
const INT_KEY_NAMESPACE = hash512(INT_KEY_FAMILY).substring(0, 6)
const INT_KEY_VERSION = '1.0'

const getAddress = (transactionFamily, id) => {
  return INT_KEY_NAMESPACE + hash512(id + "").slice(-64)
}

class TPHandler extends TransactionHandler {
  constructor () {
    super(INT_KEY_FAMILY, [INT_KEY_VERSION], [INT_KEY_NAMESPACE])
  }

  async apply (transactionProcessRequest, context) {    
    
    let payload = JSON.parse(Buffer.from(transactionProcessRequest.payload, 'utf8').toString());   
    
    const _p = JSON.parse(payload.payload);
    const func = _p['function'];
    const args = _p['args'];

    const funcSplit = func.split('/');
    const transactionFamily = funcSplit[0];
    const transactionFamilyVersion = funcSplit[1];
    const funcName = funcSplit[2];

    if(transactionFamily !== INT_KEY_FAMILY){
      throw new InvalidTransaction('Transaction Family does not match')
    }
    if(transactionFamilyVersion !== INT_KEY_VERSION){
      throw new InvalidTransaction('Transaction Family Version does not match')
    }

    if(!this[funcName]){
      throw new InvalidTransaction('Function does not exist')
    }

    await this[funcName].call(this, args, context)
  }

  async put({id, text}, context){
    await context.addEvent("myevent", [['name', 'handlerCalled']], Buffer.from("event", "utf8"));

    if (!id) {
      throw new InvalidTransaction('id is required')
    }

    if (!text) {
      throw new InvalidTransaction('text is required')
    }

    let stateValue = await getState(context, id + "");
    if (!stateValue) {
      stateValue = {};
    }
  
    stateValue['text'] = text
  
    await putState(context, id+"", stateValue);
    return;
  }
}


async function getRawState(context, address){
  let possibleAddressValues = await context.getState([address])
  let stateValueRep = possibleAddressValues[address]

  if (!stateValueRep || stateValueRep.length == 0) {
    return;
  }
  return stateValueRep;
}

async function getState(context, key){
  let address = getAddress(INT_KEY_FAMILY, key);

  const rawState = await getRawState(context, address);
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
  let address = getAddress(INT_KEY_FAMILY, key);

  const rawState = await getRawState(context, address);
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
    [address]: Buffer.from(JSON.stringify(toSave), 'utf8')
  })

  if(addresses.length === 0){
    throw new InternalError('State Error!')
  }
}

async function deleteState(context, key, value){
  let address = getAddress(INT_KEY_FAMILY, key);

  const rawState = await getRawState(context, address);
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

module.exports = TPHandler;

