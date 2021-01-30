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

const { TransactionHandler } = require('sawtooth-sdk/processor/handler')
const {
  InvalidTransaction,
  InternalError
} = require('sawtooth-sdk/processor/exceptions')

const crypto = require('crypto')

const _hash = (x) =>
  crypto.createHash('sha512').update(x).digest('hex').toLowerCase()

const INT_KEY_FAMILY = 'intkey'
const INT_KEY_NAMESPACE = _hash(INT_KEY_FAMILY).substring(0, 6)

let address

class TPHandler extends TransactionHandler {
  constructor () {
    super(INT_KEY_FAMILY, ['1.0'], [INT_KEY_NAMESPACE])
  }

  async apply (transactionProcessRequest, context) {    
    await context.addEvent("myevent", [['name', 'handlerCalled']], Buffer.from("event", "utf8"));
    
    let update = JSON.parse(Buffer.from(transactionProcessRequest.payload, 'utf8'))
    let name = update.Name
    if (!name) {
      throw new InvalidTransaction('Name is required')
    }

    let value = update.Value
    if (value === null || value === undefined) {
      throw new InvalidTransaction('Value is required')
    }

    address = INT_KEY_NAMESPACE + _hash(name).slice(-64)

    let possibleAddressValues = await context.getState([address])
    let stateValueRep = possibleAddressValues[address]

    let stateValue
    if (stateValueRep && stateValueRep.length > 0) {
      // stateValue = cbor.decodeFirstSync(stateValueRep)
      stateValue = JSON.parse(Buffer.from(stateValueRep, 'utf8').toString())
      let stateName = stateValue[name]
      if (stateName) {
        // console.log("Overwriting variable");
      }
    }
  
    // 'set' passes checks so store it in the state
    if (!stateValue) {
      stateValue = {}
    }
  
    stateValue[name] = value
  
    console.log('address', address)
    console.log(`Name: ${name} Value: ${value}`)

    let addresses = await context.setState({
      [address]: Buffer.from(JSON.stringify(stateValue), 'utf8')
    })
    // console.log("Saved: ", Buffer.from(JSON.stringify(stateValue), 'utf8'))

    if (addresses.length === 0) {
      throw new InternalError('State Error!')
    }
    return;
  }
}

module.exports = TPHandler;

