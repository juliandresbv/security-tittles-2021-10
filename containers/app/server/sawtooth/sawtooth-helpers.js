const {createContext, CryptoFactory} = require('sawtooth-sdk/signing')

const context = createContext('secp256k1')
const privateKey = context.newRandomPrivateKey();
// const privateKey = Buffer.from(process.env.SAWTOOTH_PRIVATE_KEY.slice(2), 'hex');
const signer = (new CryptoFactory(context)).newSigner(privateKey)
const crypto = require('crypto');
const {protobuf} = require('sawtooth-sdk')
const axios =  require('axios').create({});
axios.defaults.timeout = 10*1000;
const _ = require('underscore')

const hash = (x) =>
  crypto.createHash('sha512').update(x).digest('hex').toLowerCase()


const getAddress = (transactionFamily, varName) => {
  const INT_KEY_NAMESPACE = hash(transactionFamily).substring(0, 6)
  return INT_KEY_NAMESPACE + hash(varName).slice(-64)
}

module.exports.getAddress = getAddress;

module.exports.sendTransaction = async function (transactionFamily, payload, cancelToken /*Optional*/){

  const address = getAddress(transactionFamily, payload.Name)

  const payloadBytes = Buffer.from(JSON.stringify(payload), 'utf8')
  
  const {createHash} = require('crypto')
  
  const transactionHeaderBytes = protobuf.TransactionHeader.encode({
    familyName: 'intkey',
    familyVersion: '1.0',
    inputs: [address],
    outputs: [address],
    signerPublicKey: signer.getPublicKey().asHex(),
    // In this example, we're signing the batch with the same private key,
    // but the batch can be signed by another party, in which case, the
    // public key will need to be associated with that key.
    batcherPublicKey: signer.getPublicKey().asHex(),
    // In this example, there are no dependencies.  This list should include
    // an previous transaction header signatures that must be applied for
    // this transaction to successfully commit.
    // For example,
    // dependencies: ['540a6803971d1880ec73a96cb97815a95d374cbad5d865925e5aa0432fcf1931539afe10310c122c5eaae15df61236079abbf4f258889359c4d175516934484a'],
    dependencies: [],
    payloadSha512: createHash('sha512').update(payloadBytes).digest('hex'),
    nonce:crypto.randomBytes(12).toString('hex')
  }).finish()
  
  let signature = signer.sign(transactionHeaderBytes)
  
  const transaction = protobuf.Transaction.create({
    header: transactionHeaderBytes,
    headerSignature: signature,
    payload: payloadBytes
  })
  
  //--------------------------------------
  //Optional
  //If sending to sign outside
  
  const txnListBytes = protobuf.TransactionList.encode({transactions:[
    transaction
  ]}).finish()
  
  //const txnBytes2 = transaction.finish()
  
  let transactions = protobuf.TransactionList.decode(txnListBytes).transactions;
  
  //----------------------------------------
  
  //transactions = [transaction]
  
  const batchHeaderBytes = protobuf.BatchHeader.encode({
    signerPublicKey: signer.getPublicKey().asHex(),
    transactionIds: transactions.map((txn) => txn.headerSignature),
  }).finish()
  
  
  
  signature = signer.sign(batchHeaderBytes)
  
  const batch = protobuf.Batch.create({
    header: batchHeaderBytes,
    headerSignature: signature,
    transactions: transactions
  })
  
  const batchListBytes = protobuf.BatchList.encode({
    batches: [batch]
  }).finish();
  
  let params = {
    headers: {'Content-Type': 'application/octet-stream'}
  };
  if(cancelToken){
    params.cancelToken = cancelToken;
  } 
  return axios.post(`${process.env.SAWTOOTH_REST}/batches`, batchListBytes, params);
  
}

module.exports.queryState = async function (transactionFamily, varName, cancelToken){
  const address = getAddress(transactionFamily, varName);
  let params = {
    headers: {'Content-Type': 'application/json'}
  };
  if(cancelToken){
    params.cancelToken = cancelToken;
  } 
  console.log("to:", `${process.env.SAWTOOTH_REST}/state/${address}`)
  let response = await axios.get(`${process.env.SAWTOOTH_REST}/state/${address}`, params);
  let base = Buffer.from(response.data.data, 'base64');
  let stateValue = JSON.parse(base.toString('utf8'));
  return stateValue
}

const { Stream } = require('sawtooth-sdk/messaging/stream')
const {
  Message,
  EventList,
  EventSubscription,
  EventFilter,
  StateChangeList,
  ClientEventsSubscribeRequest,
  ClientEventsSubscribeResponse
} = require('sawtooth-sdk/protobuf')


const PREFIX = hash("intkey").substring(0, 6);
console.log(PREFIX);
const NULL_BLOCK_ID = '0000000000000000'

const VALIDATOR_HOST = process.env.VALIDATOR_HOST;
// const VALIDATOR_HOST = 'tcp://localhost:4004';
console.log('connecting to ', VALIDATOR_HOST);
stream = new Stream(VALIDATOR_HOST);


module.exports.subscribeToSawtoothEvents = () =>{
    return new Promise((resolve)=>{
        stream.connect(()=>{
          stream.onReceive(handleEvent);
          subscribe().then(resolve);
          console.log('Connected');
        });
      })
}

const handleEvent = msg => {
  // const mmm = EventList.decode(msg.content).events
  // console.log('events', mmm);
  if (msg.messageType === Message.MessageType.CLIENT_EVENTS) {
    const events = EventList.decode(msg.content).events;
    // console.log(events)
    _.forEach(events, e => {
      if(e.eventType == 'myevent'){
        // console.log(e)
        // console.log('EVENT - data:', Buffer.from(e.data, 'utf8').toString('utf8'))
      }
      else if(e.eventType === 'sawtooth/block-commit'){
        // console.log(e);
      }
      else if(e.eventType === 'sawtooth/state-delta'){
        // let a = protobuf.StateChangeList.decode(e.data);
        // console.log(a.stateChanges[0].value.toString('utf8'));

      }
    })
    // deltas.handle(getBlock(events), getChanges(events))
  } else {
    console.warn('Received message of unknown type:', msg.messageType)
  }
}


const subscribe = () => {
  const blockSub = EventSubscription.create({
    eventType: 'sawtooth/block-commit'
  })
  const deltaSub = EventSubscription.create({
    eventType: 'sawtooth/state-delta',
    filters: [EventFilter.create({
      key: 'address',
      matchString: `^${PREFIX}.*`,
      filterType: EventFilter.FilterType.REGEX_ANY
    })]
  })

  const mySub = EventSubscription.create({
    eventType: 'myevent'
  })

  return stream.send(
    Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_REQUEST,
    ClientEventsSubscribeRequest.encode({
      lastKnownBlockIds: [NULL_BLOCK_ID],
      subscriptions: [
        blockSub, 
        deltaSub, 
        mySub
      ]
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
