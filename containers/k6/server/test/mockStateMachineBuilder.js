const {produce} = require('immer');
const { job } = require('../scripts/src/stateMachine');
const _ = require('underscore');


const stateMachine = {
  apply: (state, event) => {

    let next_n;
    let next_n_max;
    let next_name;

    if(event && event.type === 'INIT'){
      next_n = 0;
      next_n_max = event.payload;
    }
    else{
      next_n = state.n + 1;
      next_n_max = state.n_max;
    }

    if(next_n >= next_n_max){
      next_name = 'DONE';
    }
    else{
      next_name = 'WORKING';
    }


    return {
      n: next_n,
      n_max: next_n_max,
      name: next_name,
      _locks: [next_n % 4]
    }
  },
  job: async (state) =>{
    console.log('j', state.n);
  }
};

/**
 * 
 * jobDelays = []
 * [-1, -1, 2]
 * ]
 * negative throws Excpetion
 */
module.exports = (jobDelays) => {
  let jobs = [];

  let jobIdx = _.mapObject(jobDelays, () => 0);

  const sm = {
    ...stateMachine,
    job: async (state) => {
      jobs.push(state);


      let delay = 1;

      if(jobDelays){
        delay = jobDelays[state.n][jobIdx[state.n]];
        jobIdx[state.n] = jobIdx[state.n] + 1;
      }

      if(delay < 0){
        await sleep(-delay);
        throw new Error('some error');
      }
      else {
        await sleep(delay);
      }

      return stateMachine.job;
    },
    _jobs: jobs
  }
  return sm;
}



function sleep(m){
  return new Promise((resolve) => setTimeout(resolve, m));  
}