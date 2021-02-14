const crypto = require('crypto')

const {
  InvalidTransaction
} = require('sawtooth-sdk/processor/exceptions');

const TP_FAMILY = 'intkey';
const TP_VERSION = '1.0';

const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const TP_NAMESPACE = hash512(TP_FAMILY).substring(0, 6)

const address = (key) => {
  return TP_NAMESPACE + hash512(key).slice(-64)
}


const handlers = {
  async put(context, {id, value}){
    
    await context.addEvent("myevent", [['name', 'handlerCalled']], Buffer.from("event", "utf8"));

    if (!id) {
      throw new InvalidTransaction('id is required')
    }

    if (!value) {
      throw new InvalidTransaction('value is required')
    }

    let stateValue = await context.getState(id + "");
    if (!stateValue) {
      stateValue = null;
    }
  
    stateValue = value;
  
    await context.putState(id+"", stateValue);
    // await context.deleteState(id+"");

    return;
  }
};

module.exports = {TP_FAMILY, TP_VERSION, TP_NAMESPACE, handlers, address}