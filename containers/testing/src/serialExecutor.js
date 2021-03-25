const _ = require('underscore');
const log = require('./log');
const {produce} = require('immer');


const MAX_RETRIES = 1;
const CHECKPOINT_AFTER = 2;


module.exports = async function(stateMachine, n_max){
  await log.init();

  let state;
  let lastStateDone = await getLastState();

  if(!lastStateDone){
    console.log('INIT');
    state = stateMachine.apply(null, {type: 'INIT', payload: n_max});
  }
  else{
    console.log('Last Commit:', lastStateDone.n);

    lastStateDone.n_max = n_max;
    state = stateMachine.apply(lastStateDone);
  }

  let lastIdxCommited = -1;
  let lastIdxDone = -1;
  let err;

  async function execute(){
    while(state.name !== 'DONE'){
      try {
        let s = state;
        await retry(() => stateMachine.job(s), MAX_RETRIES);
        lastStateDone = s;
        lastIdxDone = lastIdxDone + 1;
        state = stateMachine.apply(state);
      }
      catch(e){
        err = e;
        break;
      }
  
      if(lastIdxDone - lastIdxCommited > CHECKPOINT_AFTER){
        console.log('check', lastIdxDone - lastIdxCommited)
        checkpoint(lastStateDone);
        lastIdxCommited = lastIdxDone;
      }
    }
    if(lastIdxDone > -1){
      checkpoint(lastStateDone);
    }
  
    if(state.name === 'DONE'){
      console.log('DONE')
    }
  
    if(err){
      throw err;
    }
    await log.close();

  }
  
  function close(){
    console.log('check', lastStateDone.n);
    checkpoint(lastStateDone);
  }

  let executePromise = execute();

  return {executePromise, close}
}


function checkpoint(state){
  log.log(JSON.stringify(state));
}

async function getLastState(){
  let last_line = await log.lastLog();
  if(last_line){
    return JSON.parse(last_line);
  }
  return null;
}



async function retry(job, max_retries){
  let r = 0;
  let sleep_time = 100; //Exponential backup

  let res = null; 
  let er = null;
  while(r < max_retries){
    try{
      res = await job();
      return res;
    }
    catch(err){
      console.log(err);
      er = err;
      await sleep(sleep_time);
      sleep_time = sleep_time * 2;
    }
    r = r + 1;
  }
  throw er;
}

function sleep(m){
  return new Promise((resolve) => setTimeout(resolve, m));  
}