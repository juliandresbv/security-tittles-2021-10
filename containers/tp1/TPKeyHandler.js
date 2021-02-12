'use strict'

const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
const {
  InvalidTransaction
} = require('sawtooth-sdk/processor/exceptions')

const keyState = require('./keyState');


module.exports = function({TP_FAMILY, TP_VERSION, TP_NAMESPACE, address, handlers}){
  const {getState, putState} = keyState(address);

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
  
      await handlers[func].call(this, params, context, {getState, putState})
    }
  }
  return TPHandler;
};



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


