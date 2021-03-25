const _ = require('underscore');
const log = require('./log');

const MAX_ERRORS = 20;
const CHECKPOINT_AFTER = 2;
let errors = 0;
const {produce} = require('immer');


const CONCURRENCY = 2;

let jobs = {};
let jobsState = {};
function addJob(job, idx){
  let j = (async () => {
    try {
      await retry(job, 10);
      return idx;
    }
    catch(err){
      throw idx;
    }
  })();
  jobs[idx] = j;
}


module.exports = async function(state, stateMachine){
  let lastIdxCommited = -1;

  let lastStateDone = null;
  let lastIdxDone = -1;

  let lastStateAdded = state;
  let lastIdxAdded = 0;
  while(lastStateAdded || _.size(jobs) > 0){

    while(lastStateAdded && (_.size(jobs) < CONCURRENCY)){
      let s = produce(lastStateAdded, () =>{});
      jobsState[lastIdxAdded] = s;
      addJob(() => stateMachine.job(s), lastIdxAdded);

      lastStateAdded = stateMachine.apply(lastStateAdded);
      lastIdxAdded = lastIdxAdded + 1;
    }

    try{
      let fjobs = _.values(jobs);
      let idx = await Promise.race(fjobs);
      delete jobs[idx];


      let minWorking = _.chain(jobs).keys().map(k => parseInt(k, 10)).min().value();

      let commited = _.chain(jobsState).keys().map(k => parseInt(k, 10)).filter(k => k < minWorking).value();
      
      if(commited.length > 0){
        lastIdxDone = _.max(commited);
        lastStateDone = jobsState[lastIdxDone];
        jobsState = _.omit(jobsState, commited);
  
  
        if(lastIdxDone - lastIdxCommited > CHECKPOINT_AFTER){
          console.log('check', lastIdxDone - lastIdxCommited)
          checkpoint(lastStateDone);
          lastIdxCommited = lastIdxDone;
        }
      }
      

    }
    catch(err){
      console.log('err', err);
    }
    // sleep(1000);
    // break;



    

    // let job = async () => {
    //   await stateMachine.job(state);
    // };

    // let err = await attemptWithRetries(job, 5);
    // errors = errors + err;

    // if(err){
    //   checkpoint(state);
    //   c = 0;

    //   if(errors >= MAX_ERRORS){
    //     console.log('Max errors exceeded');
    //     break;
    //   }  
    // }

    // let nextState = stateMachine.update(state);
    // if(!nextState){
    //   checkpoint(state);  //Save last not null state
    //   state = nextState;
    // }
    // else{
    //   state = nextState;
    //   c = c + 1;
    //   if(c >= CHECKPOINT_AFTER){
    //     checkpoint(state);
    //     c = 0;
    //   }
    // }
  }
  checkpoint(lastStateDone);




  // console.log('Last:', last_n)

  // for(let n = last_n + 1; n < n_max; n++){
  //   jobFunc(n);
  //   await log.log(n)
  // }

  await log.close();
}

function checkpoint(state){
  log.log(JSON.stringify(state));
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