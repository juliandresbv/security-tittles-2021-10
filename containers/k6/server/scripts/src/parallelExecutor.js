const _ = require('underscore');
const {produce} = require('immer');


const MAX_RETRIES = 10;
const CHECKPOINT_AFTER = 2;
const DEFAULT_CONCURRENCY = 10;

module.exports = async function(stateMachine, initialEvent, logger, concurrency){

  let realConcurrency = DEFAULT_CONCURRENCY;
  if(concurrency){
    realConcurrency = concurrency;
  }

  let closing = false; 

  let state;
  let lastStateDone = await getLastState(logger);

  if(!lastStateDone){
    console.log('INIT');
    state = await stateMachine.apply(null, initialEvent);
  }
  else{
    console.log('Last Commit:', lastStateDone.n);

    lastStateDone.n_max = initialEvent.payload;
    state = await stateMachine.apply(lastStateDone);
  }

  let lastIdxCommited = -1;
  let lastIdxDone = -1;
  let idx = lastIdxCommited + 1;
  let err;

  let jobQueue = [];

  async function execute(){
    
    do{
      while(state.name !== 'DONE' && (jobQueue.length < realConcurrency) && !closing){
                
        let s = state;
        let i = idx;

        let locks = s._locks;
        let usedLocks = _.chain(jobQueue).map(j => j.locks).flatten().value();
        if(_.any(locks, l => _.contains(usedLocks, l))){
          break;
        }

        let job = retry(async () => {
          try{
            await stateMachine.job(s);
            return [null, i];
          }
          catch(err){
            throw [err, i]
          }
        }, MAX_RETRIES);

        jobQueue.push({job, idx: i, state: s, done: false, locks});
        idx = idx + 1;
        state = await stateMachine.apply(state);
      }
      if(jobQueue.length == 0){
        continue;
      }

      try {
        let fjobs = _.chain(jobQueue)
          .filter(j => !j.done)
          .map(j => j.job)
          .value();

        let idx = await Promise.race(fjobs);

        for(let j = 0; j < jobQueue.length; j++){
          if(jobQueue[j].idx === idx[1]){
            jobQueue[j].done = true;
            break;
          }
        }

        while(jobQueue.length > 0 && jobQueue[0].done === true){
          let j = jobQueue.shift();
          lastStateDone = j.state;
          lastIdxDone = j.idx;
        }
      }
      catch([n, e]){
        err = e;
        break;
      }
  
      if(lastIdxDone - lastIdxCommited > CHECKPOINT_AFTER){
        // console.log('check', lastIdxDone - lastIdxCommited)
        checkpoint(lastStateDone, logger);
        lastIdxCommited = lastIdxDone;
      }
    } while(jobQueue.length > 0 || (state.name !== 'DONE' && !closing));


    console.log('...');
    if(lastIdxDone > -1){
      checkpoint(lastStateDone, logger);
    }
  
    if(state.name === 'DONE'){
      console.log('DONE')
    }
  
    if(err){
      throw err;
    }
  }
  
  function close(){
    closing = true;
  }

  let executePromise = execute();

  return {executePromise, close}
}


function checkpoint(state, logger){
  logger.log(JSON.stringify(state));
  console.log('check:', state.n);
}

async function getLastState(logger){
  let last_line = await logger.lastLog();
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
      er = err;
      await sleep(sleep_time);
      sleep_time = sleep_time * 2;
    }
    r = r + 1;
  }
  console.log('r:', r)
  throw er;
}

function sleep(m){
  return new Promise((resolve) => setTimeout(resolve, m));  
}