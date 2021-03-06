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

const BLOCKS_FILE = '../server/data/blocks.json';
const STATE_FILE = '../server/data/state.json';
const CURRENT_STATE_FILE = '../server/data/current_state.json';


let blocks = [];
let state = {};
let current_state = {}; //If forks never happen, this might be the only data necessary to store.


let transactions = {};

(async () => {
  blocks = await readFile(BLOCKS_FILE) || [];
  state = await readFile(STATE_FILE) || {};

  // const lastBlock = (blocks.length > 0)? blocks[blocks.length - 1].block_id: sawtoothHelper.NULL_BLOCK_ID;
  const lastBlock = sawtoothHelper.NULL_BLOCK_ID;

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
      transactions = _.extend(transactions, getTransactions(block));
      addState(block, events);
      // updateCurrentState(block, events);
      current_state = recalculateCurrentState(blocks, transactions);

      blocks.push(block);
      lastBlock = block.block_id;
    }
    else{
      transactions = _.extend(transactions, getTransactions(block));
      addState(block, events);
      // updateCurrentState(block, events);
      current_state = recalculateCurrentState(blocks, transactions);

      // recalculateCurrentState(blocks);

    }
  }
  else{
    // Fork
    
    //Remove invalid data
    blocks = _.filter(blocks, (b) => {
      b.block_num < block.block_num
    });

    state = _.mapObject(state, (v, k) => {
      return _.filter(v, e => {
        e.block_num < block.block_num
      });
    });
    transactions = recalculateTransactions(blocks);
    // current_state = recalculateCurrentState(transactions);

    transactions = _.extend(transactions, getTransactions(block));
    addState(block, events);

    blocks.push(block);
    lastBlock = block.block_id;
  }

  await writeFile(BLOCKS_FILE, blocks);
  await writeFile(STATE_FILE, state);
  await writeFile(CURRENT_STATE_FILE, current_state);

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

function transactionsInOrder(allBlocks){
  return _.chain(allBlocks)
  .map(block => {
    return _.chain(block.batches)
      .map(b => {
        return _.map(b.transactions, t => {
          let payload;
          try {
            payload = JSON.parse(Buffer.from(t.payload, 'base64').toString('utf-8'));
          }
          catch (err) {
            payload = Buffer.from(t.payload, 'base64').toString('utf-8');
          }
          return {
            block_id: block.block_id,
            block_num: block.block_num,
            // batch_id: b.header_signature,
            // transaction_id: t.header_signature,
            payload: payload,
            family_name: t.header.family_name
          };
        });
      })
      .flatten()
      .value();
  })
  .flatten()
  .filter(t => t.family_name === 'todos')
  .value();
}

function recalculateTransactions(allBlocks) {
  transactionsInOrder(allBlocks)
    .indexBy(t => t.payload.args.txid)
    .value();
}

function getTransactions(block) {
  return _.chain(block.batches)
    .map(b => {
      return _.map(b.transactions, t => {
        let payload;
        try {
          payload = JSON.parse(Buffer.from(t.payload, 'base64').toString('utf-8'));
        }
        catch (err) {
          payload = Buffer.from(t.payload, 'base64').toString('utf-8');
        }
        return {
          block_id: block.block_id,
          block_num: block.block_num,
          // batch_id: b.header_signature,
          // transaction_id: t.header_signature,
          payload: payload,
          family_name: t.header.family_name
        };
      });
    })
    .flatten()
    .filter(t => t.family_name === 'todos')
    .indexBy(t => t.payload.args.txid)
    .value();
}

function addState(block, events){
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


function updateCurrentState(_current_state, block, events){
  _.forEach(events, (e) => {    
  
    if(e.type === 'SET'){
      try{
        const jlist = JSON.parse(e.value);
        _.forEach(jlist, j => {
          
          let current = j.key;
          let history = [transactions[current]];

          while(current != null){
            let p = JSON.parse(transactions[current].payload.args.transaction);
            current = p.input;

            if(current != null){
              if(_current_state[current]){
                history = _current_state[current].history.concat(history)
                delete _current_state[current];
                break;
              }

              history.unshift(transactions[current]);
            }
          }

          _current_state[j.key] = {
            value: j.value,
            block_id: block.block_id,
            history
          };
        })
      }
      catch(err){
        return;
      }
    }
    else if(e.type === 'DELETE'){
      //Ignoring this because in the todo app every DELETE comes with a SET
    }
  });

  return _current_state;
}

function recalculateCurrentState(allBlocks, allTransactions){
  let _current_state = {};
  let orderedTransactions = transactionsInOrder(allBlocks);
  _.forEach(orderedTransactions, (t) => {
      let current = t.payload.args.txid;
      
      let history = [allTransactions[current]];
      while(current != null){
        let p = JSON.parse(allTransactions[current].payload.args.transaction);
        current = p.input;

        if(current != null){
          if(_current_state[current]){
            history = _current_state[current].history.concat(history)
            delete _current_state[current];
            break;
          }

          history.unshift(allTransactions[current]);
        }
      }

      _current_state[t.payload.args.txid] = {
        value: j.value,
        block_id: block.block_id,
        history
      };

    });

  return _current_state;
}

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


let startshutdown = false;
async function shutdown(){
  if(startshutdown){
    return;
  }
  startshutdown = true;

  return new Promise((resolve, reject) => {
    let end = false;
    const finish = (err) => {
      if(!end){
        if(err){
          console.log(err.message);
          resolve();
        }
        console.log('shut down normally');
        resolve();
      }
      end = true;
    };

    (async () => {
      await writeFile(BLOCKS_FILE, blocks);
      await writeFile(STATE_FILE, state);
      await sawtoothHelper.close();
      finish();
    })();

    setTimeout(() => finish(new Error('Timeout')), 2000);
  });  
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
