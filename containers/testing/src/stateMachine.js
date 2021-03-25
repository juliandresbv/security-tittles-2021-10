const seedrandom = require('seedrandom');
const {produce} = require('immer');

module.exports = {
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
        return {
          name: 'DONE',
          n: s.n + 1,
          n_max: s.n_max
        };
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