const log = require('./log');

const MAX_ERRORS = 20;
const CHECKPOINT_AFTER = 5;
let errors = 0;

module.exports = async function(state, stateMachine){
  let c = 0;

  while(state){

    let job = async () => {
      await stateMachine.job(state);
    };

    let err = await attemptWithRetries(job, 5);
    errors = errors + err;

    if(err){
      checkpoint(state);
      c = 0;

      if(errors >= MAX_ERRORS){
        console.log('Max errors exceeded');
        break;
      }  
    }

    let nextState = stateMachine.update(state);
    if(!nextState){
      checkpoint(state);  //Save last not null state
      state = nextState;
    }
    else{
      state = nextState;
      c = c + 1;
      if(c >= CHECKPOINT_AFTER){
        checkpoint(state);
        c = 0;
      }
    }
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

async function attemptWithRetries(job, max_retries){
  let r = 0;
  let sleep_time = 100; //Exponential backup

  while(r < max_retries){
    try{
      await job();
      break;
    }
    catch(err){
      console.log(err);
      await sleep(sleep_time);
      sleep_time = sleep_time * 2;
    }
    r = r + 1;
  }
  return r;
  
}

function sleep(m){
  return new Promise((resolve) => setTimeout(resolve, m));  
}