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

module.exports.getAddress = getAddress;

function buildBatch(
  transactionFamily, 
  transactionFamilyVersion,
  inputs,
  outputs,
  payload)
{
  const payloadBytes = Buffer.from(payload, 'utf8')
    
  const transactionHeaderBytes = protobuf.TransactionHeader.encode({
    familyName: transactionFamily,
    familyVersion: transactionFamilyVersion,
    inputs,
    outputs,
    signerPublicKey: publicKeyHex,
    // In this example, we're signing the batch with the same private key,
    // but the batch can be signed by another party, in which case, the
    // public key will need to be associated with that key.
    batcherPublicKey: publicKeyHex,
    // In this example, there are no dependencies.  This list should include
    // an previous transactioun header signatures that must be applied for
    // this transaction to successfully commit.
    // For example,
    // dependencies: ['540a6803971d1880ec73a96cb97815a95d374cbad5d865925e5aa0432fcf1931539afe10310c122c5eaae15df61236079abbf4f258889359c4d175516934484a'],
    dependencies: [],
    payloadSha512: hash512(payloadBytes),
    nonce: crypto.randomBytes(32).toString('hex')
  }).finish()
  

  let signature = sign(transactionHeaderBytes, privateKey);

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
    signerPublicKey: publicKeyHex,
    transactionIds: transactions.map((txn) => txn.headerSignature),
  }).finish()
  
  
  signature = sign(batchHeaderBytes, privateKey);
  
  const batch = protobuf.Batch.create({
    header: batchHeaderBytes,
    headerSignature: signature,
    transactions: transactions
  })
  
  return protobuf.BatchList.encode({
    batches: [batch]
  }).finish();
}


module.exports.sendTransaction = async function (
  transactionFamily, 
  transactionFamilyVersion, 
  inputs,
  outputs,
  payload, 
  cancelToken /*Optional*/){

  const batchListBytes = buildBatch(transactionFamily, transactionFamilyVersion, inputs, outputs, payload);
  
  let params = {
    headers: {'Content-Type': 'application/octet-stream'}
  };
  if(cancelToken){
    params.cancelToken = cancelToken;
  } 
  return axios.post(`${process.env.SAWTOOTH_REST}/batches`, batchListBytes, params);
}

const TIMEOUT = 1000*10;

module.exports.sendTransactionWithAwait = async function (
  transactionFamily, 
  transactionFamilyVersion, 
  inputs,
  outputs,
  payload){
  return new Promise((resolve, reject) => {
    let timeoutTimer = undefined;
    let timer1 = undefined;
    let axiosSource = CancelToken.source();

    function releaseResources(){
      if(timeoutTimer){
        clearTimeout(timeoutTimer);
        timeoutTimer.unref();
      }
      if(timer1){
        clearTimeout(timer1);
        timer1.unref();
      }
      if(axiosSource){
        axiosSource.cancel();
      }
    }

    let finished = false;
    
    function respond(err, value){
      if(finished){
        return;
      }

      finished = true;
      releaseResources();

      if(err){
        reject(err);
      }
      resolve(value);
    }

    timeoutTimer = setTimeout(() =>{
      respond(new Error('Timeout'));
    }, TIMEOUT);

    let statusLink;

    (async ()=>{
      try{

        let response = await module.exports.sendTransaction(
          transactionFamily, 
          transactionFamilyVersion , 
          inputs,
          outputs, 
          payload, 
          axiosSource.token);
  
        if(!response.data || !response.data.link){
          return respond(new Error("Transaction response err"));
        }
        statusLink = response.data.link;
      }
      catch(e){
        return respond(e);
      }
  
  
      try{
        let batchStatus;
        let batchData;
        let retries = 0;
        while(batchStatus !== "COMMITTED" && retries < 20){
          if(finished){
            return;
          }
          await new Promise((resolve) => {
            timer1 = setTimeout(resolve, 200 + 100*Math.pow(2, retries));
          });
  
  
          let value = await axios.get(`${statusLink}&wait=4`, {
            cancelToken: axiosSource.token
          });
      
          if(value.data && 
            value.data.data && 
            value.data.data[0])
          {
            batchData = value.data;
            batchStatus = value.data.data[0].status;
            if(batchStatus === 'INVALID'){
              break;
            }
          }
          retries = retries + 1;
        }
        //https://sawtooth.hyperledger.org/docs/core/nightly/1-1/rest_api/endpoint_specs.html
        if(batchStatus !== "COMMITTED"){
          if(batchStatus === 'INVALID'){
            let e = new Error('Invalid transaction');
            e.data = batchData;
            return respond(e);
          }
          else if(batchStatus === 'PENDING'){
            let err = new Error('PENDING transaction');
            err.data = {statusLink}
            return respond(err);
          }
          else if(batchStatus === 'UNKNOWN'){
            return respond(new Error('Unknown transaction'));
          }
          else{
            return respond(new Error('Unknown error'));
          }
        }
  
      }
      catch(e){
        return respond(e);
      }

      return respond(null, "ok")

      // // Should you query the state (which one)??
      // if(finished){
      //   return;
      // }
  
      // try{
      //   let value = await module.exports.queryState(inputs[0], axiosSource.token);
      //   return respond(null, value);
      // }
      // catch(e){
      //   return respond(e);
      // }

    })();
  });
}

module.exports.queryState = async function (address, cancelToken){
  let params = {
    headers: {'Content-Type': 'application/json'}
  };
  if(cancelToken){
    params.cancelToken = cancelToken;
  } 
  let response = await axios.get(`${process.env.SAWTOOTH_REST}/state/${address}`, params);
  let base = Buffer.from(response.data.data, 'base64');
  let stateValue = JSON.parse(base.toString('utf8'));
  return stateValue;
}


const { Stream } = require('sawtooth-sdk/messaging/stream')
const {
  Message,
  EventList,
  EventSubscription,
  EventFilter,
  // StateChangeList,
  ClientEventsSubscribeRequest,
  ClientEventsSubscribeResponse
} = require('sawtooth-sdk/protobuf')


const PREFIX = hash512("intkey").substring(0, 6);
const NULL_BLOCK_ID = '0000000000000000'

const VALIDATOR_HOST = process.env.VALIDATOR_HOST;
// const VALIDATOR_HOST = 'tcp://localhost:4004';
console.log('connecting to ', VALIDATOR_HOST);
const stream = new Stream(VALIDATOR_HOST);


module.exports.subscribeToSawtoothEvents = (handlers) =>{
  return new Promise((resolve)=>{
    stream.connect(()=>{
      stream.onReceive(handleEvent(handlers));
      subscribe(handlers).then(resolve);
      console.log('Connected');
    });
  })
}

const handleEvent = handlers => msg => {
  if (msg.messageType === Message.MessageType.CLIENT_EVENTS) {
    const events = EventList.decode(msg.content).events;
    _.forEach(events, e => {
      if(handlers[e.eventType]){
        handlers[e.eventType](e);
      }
    })
  } else {
    console.warn('Received message of unknown type:', msg.messageType)
  }
}


const subscribe = (handlers) => {

  const subscriptions = _.chain(handlers)
    .keys()
    .map(k => {
      if(k === 'sawtooth/state-delta'){
        return EventSubscription.create({
          eventType: 'sawtooth/state-delta',
          filters: [EventFilter.create({
            key: 'address',
            matchString: `^${PREFIX}.*`,
            filterType: EventFilter.FilterType.REGEX_ANY
          })]
        });
      }

      return EventSubscription.create({
        eventType: k
      });
    })
    .value();

  return stream.send(
    Message.MessageType.CLIENT_EVENTS_SUBSCRIBE_REQUEST,
    ClientEventsSubscribeRequest.encode({
      lastKnownBlockIds: [NULL_BLOCK_ID],
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
