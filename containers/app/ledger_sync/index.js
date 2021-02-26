require('dotenv').config()
const _ = require('underscore');

const {subscribeToSawtoothEvents} = require('./src/sawtooth/sawtooth-helpers');


function blockCommitHandler(e){
  const block = _.chain(e.attributes)
    .map((e) => [e.key, e.value])
    .object()
    .value();
  
  const b = {
    block_num: parseInt(block.block_num, 10),
    block_id: block.block_id,
    state_root_hash: block.state_root_hash,
  }
  console.log(b);
}

function stateDeltaHandler(e){
  console.log(e);
  console.log('>')
}



const handlers = {
  // 'myevent': (e) => {console.log(e)},
  // 'sawtooth/block-commit': blockCommitHandler,
  'sawtooth/state-delta': stateDeltaHandler
};

subscribeToSawtoothEvents(handlers)