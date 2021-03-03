require('dotenv').config()
const _ = require('underscore');

const sawtoothHelper = require('./src/sawtooth/sawtooth-helpers');

const crypto = require('crypto');
const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');
const PREFIX = hash512("todos").substring(0, 6);

const {
  EventFilter,  
} = require('sawtooth-sdk/protobuf')

let blocks = [];
let state = {};

// let lastBlock =  'b1f997190939a985f841d5452bd2f06dae884b194a5641c13e77953f4546480d1e7cd3baaea2f522d109ac4fe56dacee64b07bb05fe2ff462852aed17f2d7df3';

let lastBlock = sawtoothHelper.NULL_BLOCK_ID;

function blockCommitHandler(block, events){
  console.log(block);

  // console.log(block);

  //https://github.com/hyperledger-archives/sawtooth-supply-chain/blob/master/ledger_sync/db/blocks.js
  // If the blockNum did not already exist, or had the same id
  // there is no fork, return the block
  
  let blockByNum = _.find(blocks, (b)=> b.block_num === block.block_num);
  if(!blockByNum || blockByNum.block_id === block.block_id ){
    //No fork
    if(!blockByNum){
      blocks.push(block);
      lastBlock = block.block_id;
    }
    
  }
  else{
    // Fork
    
    //Remove bad blocks
    blocks = _.filter(blocks, (b) => {
      b.block_num < block.block_num
    });

    state = _.mapObject(state, (v, k) => {
      return _.filter(v, e => {
        e.block_num < block.block_num
      });
    });

    //Add events
    blocks.push(block);
    lastBlock = block.block_id;
  }

  // console.log(state);
  //Add events
  _.forEach(events, (e) => {      
    let prev = state[e.address];
    if(!prev){
      state[e.address] = []
    }
    state[e.address].push({
      address: e.address,
      block_num: block.block_num,
      value: e.value.toString('utf-8'),
      type: e.type
    });
  });

}

/*
'sawtooth/state-delta' must be used with 'sawtooth/block-commit'
*/
const handlers = [
  {
    eventType: 'sawtooth/state-delta',
    filters: [{
      key: 'address',
      matchString: `^${PREFIX}.*`,
      filterType: EventFilter.FilterType.REGEX_ANY
    }],
    handle: null,
  },
  {
    eventType: 'sawtooth/block-commit',
    filters: [],
    handle: blockCommitHandler
  },
  // {
  //   eventType: 'myevent',
  //   filters: [],
  //   handle: (e) => console.log(e) 
  // }
]

sawtoothHelper.subscribeToSawtoothEvents(handlers, lastBlock)





//=============================================


async function shutdown(){
  await sawtoothHelper.close();
  return console.log('shutdown');
}

process.on('SIGINT', async () => {
  // await console.log('SIGINT')
  await shutdown();
  process.kill(process.pid, 'SIGUSR2');

});

process.on('SIGTERM', async () => {
  await shutdown();
  process.kill(process.pid, 'SIGUSR2');

});

process.once('SIGUSR2', async () => {
  await shutdown();
  console.log('kill');
  process.kill(process.pid, 'SIGUSR2');
});
