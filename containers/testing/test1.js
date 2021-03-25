const _ = require('underscore');
const jobExecutor = require('./src/serialExecutor')
const fsPromises = require('fs').promises;
const seedrandom = require('seedrandom');
const {produce} = require('immer');

const log = require('./src/log');


let args = process.argv.slice(2)

let from0 = false;
let n_max = null;
while(args.length > 0){
  let a = args.shift();
  if(a === '--from0'){
    from0 = true;
  }
  else{
    n_max = parseInt(a, 10);
  }
}

if(n_max == null){
  console.log("Usage:");
  console.log("node ./batchCreate.js <num_iters> --from0");
  return;
}


(async () => {
  if(from0){
    try{
      await fsPromises.unlink('./log.txt');
    }
    catch(err){
      console.log(err);
    }
  }

  await log.init();
  let last_line = await log.lastLog();
  let state;

  if(!last_line){
    console.log('INIT');
    state = stateMachine.apply(null, {type: 'INIT', payload: n_max});
  }
  else{
    state = JSON.parse(last_line);
    console.log('INIT,', state.n)
  }


  jobExecutor(state, stateMachine);

})();



const stateMachine = {
  apply: (state, event) => {
    if(event && event.type === 'INIT'){
      const rng = seedrandom('random seed', {state: true});
      return {
        seed: rng.state(),
        n: 0,
        n_max: event.payload
      };
    }

    return produce(state, s => {
      if(s.n + 1 >= s.n_max){
        return null;
      }
      s.n = s.n + 1;
      const rng = seedrandom('', {state: s.seed});
      rng();
      s.seed = rng.state();
    });
  },

  job: async (state) =>{
    let rng = seedrandom('', {state: state.seed});
    let r = rng();

    await sleep(10);
    if(Math.random() < 0.5){
      throw new Error('error');
    }
    console.log('j', state.n);
  }
}


function sleep(m){
  return new Promise((resolve) => setTimeout(resolve, m));  
}

