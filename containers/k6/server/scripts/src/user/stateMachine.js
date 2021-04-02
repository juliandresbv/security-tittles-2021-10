const seedrandom = require('seedrandom');
const {produce} = require('immer');
const {signup} = require('./signup');

const fs = require('fs');
const readline = require('readline');


let allUsersPromise;
function allUsers(){
  if(!allUsersPromise){
    allUsersPromise = new Promise((resolve, reject) =>{
      const rl = readline.createInterface({
        input: fs.createReadStream('./users.txt'),
        crlfDelay: Infinity
      });
    
      let users = [];
    
      rl.on('line', (line) => {
        users.push(JSON.parse(line));
      });
    
      rl.on('close', () => {
        resolve(users);
      });
    });
  }
  return allUsersPromise;
}


module.exports = {
  apply: (state, event) => {

    let next_n;
    let next_n_max;
    let next_name;
    let next_seed;

    if(event && event.type === 'INIT'){
      next_n = 0;
      next_n_max = event.payload;
      const rng = seedrandom('random seed', {state: true});
      next_seed = rng.state();
    }
    else{
      next_n = state.n + 1;
      next_n_max = state.n_max;
      const rng = seedrandom('', {state: state.seed});
      rng();
      next_seed = rng.state();
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
      seed: next_seed
    }
  },

  job: async (state) =>{

    let rng = seedrandom('', {state: state.seed});

    let users = await allUsers();
    let user = users[state.n];

    await signup(user.email, user.privateKey);
    console.log('j', user.email);
    // console.log('j', state.n);

  },
  locks: async (state) => {
    return [];
  }
}



function sleep(m){
  return new Promise((resolve) => setTimeout(resolve, m));  
}
