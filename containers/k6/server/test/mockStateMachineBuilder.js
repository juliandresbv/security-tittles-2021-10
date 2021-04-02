const {produce} = require('immer');
const { job } = require('../scripts/src/stateMachine');


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
      name: next_name
    }
  },
  job: async (state) =>{
    await sleep(1);
    console.log('j', state.n);
  },
  locks: async (state) => {
    // return [];
    return [state.n % 4];
  }
};

module.exports = () => {
  let jobs = [];
  const sm = {
    ...stateMachine,
    job: (state) => {
      jobs.push(state);
      return stateMachine.job;
    },
    _jobs: jobs
  }
  return sm;
}



function sleep(m){
  return new Promise((resolve) => setTimeout(resolve, m));  
}