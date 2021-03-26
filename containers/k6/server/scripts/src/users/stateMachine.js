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
