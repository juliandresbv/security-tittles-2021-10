const _ = require('underscore');
const log = require('./log');

const MAX_ERRORS = 20;
const CHECKPOINT_AFTER = 5;
let errors = 0;
const {produce} = require('immer');


const CONCURRENCY = 2;

let jobs = {};
let job_count = 0;

function addJob(job, n){
  let j = (async () => {
    try {
      await retry(job, 10);
      return n;
    }
    catch(err){
      throw n;
    }
  })();
  jobs[n] = j;
}

function canAddJob(){
  return _.size(jobs) < CONCURRENCY;
}



module.exports = async function(state, stateMachine){
  let c = 0;

  let lastState = state;
  while(lastState || _.size(jobs) > 0){

    while(lastState && (_.size(jobs) < CONCURRENCY)){
      let c = produce(lastState, () =>{});
      addJob(() => stateMachine.job(c), lastState.n)
      lastState = stateMachine.apply(lastState);
    }

    try{
      let fjobs = _.values(jobs);
      let n = await Promise.race(fjobs);
      console.log('remove, ', n);
      delete jobs[n];

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
  checkpoint(state);




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