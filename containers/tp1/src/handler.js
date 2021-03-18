const crypto = require('crypto')

const {
  InvalidTransaction
} = require('sawtooth-sdk/processor/exceptions');

const TP_FAMILY = 'todo';
const TP_VERSION = '1.0';

const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const TP_NAMESPACE = hash512(TP_FAMILY).substring(0, 6)

const addressIntKey = (key) => {
  return TP_NAMESPACE + hash512(key).slice(-64)
}
addressIntKey.keysCanCollide = true;


const handlers = {
  async post([context], {transaction, txid}){

    // await context.addEvent("myevent", [['name', 'handlerCalled']], Buffer.from("event", "utf8"));

    const {type, id, input, output} = JSON.parse(transaction);
    
    if (!type || type !== 'todo') {
      throw new InvalidTransaction('type must be todo')
    }

    if (!id) {
      throw new InvalidTransaction('id is required')
    }

    if(input != null){
      throw new InvalidTransaction('input must be null')
    }

    await context.putState(txid, output);

    // console.log(output.value);
    // await context.putState("1", output.value);
    // await context.deleteState("1");


    return;
  },
  async put([context], {transaction, txid}){

    const {type, input, output} = JSON.parse(transaction);
    
    if (!type || type !== 'todo') {
      throw new InvalidTransaction('type must be todo')
    }

    if(input == null){
      throw new InvalidTransaction('input must not be null')
    }

    let stateValue = await context.getState(input);
    if(!stateValue){
      throw new InvalidTransaction('UTXO does not exist')
    }
    if(stateValue.owner !== context.publicKey){
      throw new InvalidTransaction('not owner of UTXO')
    }

    await context.deleteState(input);
    await context.putState(txid, output);

    return;
  }
};

module.exports = {TP_FAMILY, TP_VERSION, TP_NAMESPACE, handlers, addresses:[addressIntKey]};