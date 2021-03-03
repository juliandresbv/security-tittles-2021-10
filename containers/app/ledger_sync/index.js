require('dotenv').config()
const _ = require('underscore');
const fs = require('fs');

const sawtoothHelper = require('./src/sawtooth/sawtooth-helpers');

const crypto = require('crypto');
const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');
const PREFIX = hash512("todos").substring(0, 6);

const {
  EventFilter,  
} = require('sawtooth-sdk/protobuf');
const { default: axios } = require('axios');
const { reject } = require('underscore');
const { resolve } = require('path');

const BLOCKS_FILE = './data/blocks.json';
const STATE_FILE = './data/state.json';


let blocks = [];
let state = {};

(async () => {
  blocks = await readFile(BLOCKS_FILE) || [];
  state = await readFile(STATE_FILE) || {};

  const lastBlock = (blocks.length > 0)? blocks[blocks.length - 1].block_id: sawtoothHelper.NULL_BLOCK_ID;

  sawtoothHelper.subscribeToSawtoothEvents(handlers, lastBlock);
})();


async function blockCommitHandler(block, events){
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

    console.log({
      address: e.address,
      block_num: block.block_num,
      value: e.value.toString('utf-8'),
      type: e.type
    });

  });

  // let transactions = _.chain(block.batches)
  //   .map(b => {
  //     return _.map(b.transactions, t => {
  //       let payload;
  //       try{
  //         payload = JSON.parse(Buffer.from(t.payload, 'base64').toString('utf-8'));
  //       }
  //       catch(err){
  //         payload = Buffer.from(t.payload, 'base64').toString('utf-8');
  //       }
  //       return {
  //         // block_num: block.block_num,
  //         family_name: t.header.family_name,
  //         txid: t.header_signature,
  //         batchid: b.header_signature,
  //         payload
  //       };
  //     })
  //   })
  //   .flatten()
  //   .filter(t => t.family_name === 'todos')
  //   .value();
  
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

function writeFile(file, jsonObject){
  return new Promise((resolve, reject) => {
    fs.writeFile(file, JSON.stringify(jsonObject, null, 4), (err) => {
      if(err){
        return reject(err);
      }
      return resolve();
    });
  })
}

function readFile(file){
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) =>{
      if(err){
        resolve(null);
      }
      try{
        let p = JSON.parse(data);
        return resolve(p);
      }
      catch(e){
        resolve(null);
      }
    });
  });
}




//=============================================


async function shutdown(){
  await writeFile(BLOCKS_FILE, blocks);
  await writeFile(STATE_FILE, state);
  
  await sawtoothHelper.close();
  return console.log('shutdown');  
}

process.on('SIGINT', async () => {
  // await console.log('SIGINT')
  await shutdown();
  // process.kill(process.pid, 'SIGUSR2');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await shutdown();
  // process.kill(process.pid, 'SIGUSR2');
  process.exit(0);
});

process.once('SIGUSR2', async () => {
  await shutdown();
  console.log('kill');
  // process.kill(process.pid, 'SIGUSR2');
  process.exit(0);
});
