const _ = require('underscore')
const secp256k1 = require('secp256k1');
const crypto = require('crypto');
const {protobuf} = require('sawtooth-sdk')
const axios =  require('axios').create({});
axios.defaults.timeout = 10*1000;
const CancelToken = require('axios').CancelToken;

const privateKey = Buffer.from(process.env.SAWTOOTH_PRIVATE_KEY.slice(2), 'hex');
const publicKey = secp256k1.publicKeyCreate(privateKey);
const publicKeyHex = Buffer.from(publicKey).toString('hex');

const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const hash256 = (x) =>
  crypto.createHash('sha256').update(x).digest('hex');

const getAddress = (transactionFamily, varName) => {
  const INT_KEY_NAMESPACE = hash512(transactionFamily).substring(0, 6)
  return INT_KEY_NAMESPACE + hash512(varName).slice(-64)
}

const sign = (dataBytes, privKey) => {
  const hash = hash256(dataBytes);
  return Buffer.from(
    secp256k1.ecdsaSign(
      Uint8Array.from(Buffer.from(hash, 'hex')),
      Uint8Array.from(privKey)
    ).signature
  ).toString('hex');
}




const { Stream } = require('sawtooth-sdk/messaging/stream')
const {
  Message,
  EventList,
  EventSubscription,
  EventFilter,
  StateChangeList,
  ClientEventsSubscribeRequest,
  ClientEventsUnsubscribeRequest,
  ClientEventsSubscribeResponse,
  ClientEventsUnsubscribeResponse,
  StateChange
} = require('sawtooth-sdk/protobuf')


const PREFIX = hash512("todos").substring(0, 6);
module.exports.NULL_BLOCK_ID = '0000000000000000';

const VALIDATOR_HOST = process.env.VALIDATOR_HOST;
// const VALIDATOR_HOST = 'tcp://localhost:4004';
console.log('connecting to ', VALIDATOR_HOST);
let stream = new Stream(VALIDATOR_HOST);


module.exports.subscribeToSawtoothEvents = (handlers, lastKnownBlocks) =>{
  return new Promise((resolve)=>{
    stream.connect(()=>{
      stream.onReceive(handleEvent(handlers));
      subscribe(handlers, lastKnownBlocks).then(resolve);
      console.log('Connected');
    });
  })
}

async function getBlock(events){
  const block = _.chain(events)
    .find(e => e.eventType === 'sawtooth/block-commit')
    .get('attributes')
    .map(a => [a.key, a.value])
    .object()
    .value()

  let req = await axios.get(`${process.env.SAWTOOTH_REST}/blocks/${block.block_id}`);

  return {
    block_num: parseInt(block.block_num),
    block_id: block.block_id,
    state_root_hash: block.state_root_hash,
    previous_block_id: block.previous_block_id,
    batches: req.data.data.batches
  }
}

function getChanges(events){

  return _.chain(events)
    .filter(e => {
      return e.eventType === 'sawtooth/state-delta'
    })
    .map(e => {
      let dec = StateChangeList.decode(e.data);
      return _.map(dec.stateChanges, s =>{
        let type;
        if(s.type == StateChange.Type.SET){
          type = 'SET';
        }
        else if(s.type == StateChange.Type.TYPE_UNSET){
          type = 'TYPE_UNSET';
        }
        else if(s.type == StateChange.Type.DELETE){
          type = 'DELETE';
        }
        return {
          address: s.address,
          value: s.value,
          type
        }
      });
      
    })
    .flatten()
    .value();
}

function getOtherEvents(events){
  return _.chain(events)
    .filter(e => {
      return e.eventType !== 'sawtooth/state-delta' && e.eventType !== 'sawtooth/block-commit';
    })
    .map(e => {
      return StateChangeList.decode(e.data);
    })
    .value();
}

const handleEvent = handlers => async (msg) => {
  if (msg.messageType === Message.MessageType.CLIENT_EVENTS) {
    const events = EventList.decode(msg.content).events;
    //Aparently every eventlist with sawtooth/state-delta has a corresponding sawtooth/block-commit
    const block = await getBlock(events);
    const changes = getChanges(events);
    const others = getOtherEvents(events);

    _.forEach(handlers, (h)=>{
      if(h.eventType == 'sawtooth/block-commit'){
        h.handle(block, changes);
      }
    })

  }
  // else {
  //   console.warn('Received message of unknown type:', msg.messageType)
  // }
}


const subscribe = (handlers, lastKnownBlocks) => {

  const subscriptions = _.chain(handlers)
    .map(h => {
      return EventSubscription.create({
        eventType: h.eventType,
        filters: _.map(h.filters, (f) => EventFilter.create(f))
      })
    })
    .value();

  return stream.send(
    Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_REQUEST,
    ClientEventsSubscribeRequest.encode({
      lastKnownBlockIds: [lastKnownBlocks],
      subscriptions: subscriptions
    }).finish()
  )
    .then(response => ClientEventsSubscribeResponse.decode(response))
    .then(decoded => {
      const status = _.findKey(ClientEventsSubscribeResponse.Status,
        val => val === decoded.status)
      if (status !== 'OK') {
        throw new Error(`Validator responded with status "${status}"`)
      }
    })
}

let closingPromise;

module.exports.close = function close(){
  
  if(closingPromise){
    return closingPromise;
  }

  closingPromise = stream.send(
    Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_REQUEST,
    ClientEventsUnsubscribeRequest.encode({}).finish()
  )
    .then(response => ClientEventsUnsubscribeResponse.decode(response))
    .then(decoded => {
      const status = _.findKey(ClientEventsUnsubscribeResponse.Status,
        val => val === decoded.status);      
      if (status !== 'OK') {
        throw new Error(`Validator responded with status "${status}"`)
      }
      stream.close();
      console.log('Unsubscribed to socket');
    });

  return closingPromise;
}