'use strict'

const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
const {
  InvalidTransaction
} = require('sawtooth-sdk/processor/exceptions')
const crypto = require('crypto')

const INT_KEY_FAMILY = 'intkey'
const INT_KEY_VERSION = '1.0'

const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const INT_KEY_NAMESPACE = hash512(INT_KEY_FAMILY).substring(0, 6)

const address = (key) => {
  return INT_KEY_NAMESPACE + hash512(key).slice(-64)
}

const {getState, putState} = require('./keyState')(address);

class TPHandler extends TransactionHandler {
  constructor () {
    super(INT_KEY_FAMILY, [INT_KEY_VERSION], [INT_KEY_NAMESPACE])
  }

  async apply (transactionProcessRequest, context) {    
    
    let payload = JSON.parse(Buffer.from(transactionProcessRequest.payload, 'utf8').toString());   
    const {func, params} = payload;

    if(!this[func]){
      throw new InvalidTransaction('Function does not exist')
    }

    await this[func].call(this, params, context)
  }

  async put({id, value}, context){
    await context.addEvent("myevent", [['name', 'handlerCalled']], Buffer.from("event", "utf8"));

    if (!id) {
      throw new InvalidTransaction('id is required')
    }

    if (!value) {
      throw new InvalidTransaction('value is required')
    }

    let stateValue = await getState(context, id + "");
    if (!stateValue) {
      stateValue = null;
    }
  
    stateValue = value;
  
    await putState(context, id+"", stateValue);
    return;
  }
}

module.exports = TPHandler;



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


