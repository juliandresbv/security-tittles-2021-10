const seedrandom = require('seedrandom');
const {produce} = require('immer');
const _ = require('underscore');

const fs = require('fs');
const readline = require('readline');
const sawtooth = require('./sawtooth');
const {readUsersFromFile} = require('../user/signup');

let allUsersPromise = readUsersFromFile();

module.exports = {
  apply: async (state, event) => {

    const users = await allUsersPromise;

    if(event && event.type === 'INIT'){
      const rng = seedrandom('random seed', {state: true});
      const seed = rng.state();

      const u = (rng.int32() & 0x7FFFFFFF) % event.payload.num_utxos;

      const u_i1 = (rng.int32() & 0x7FFFFFFF) % users.length;
      const user1 = users[u_i1];

      const tx = await sawtooth.createTodoTx(user1.privateKey);
      const uVal = {tx, length: 1, privatekey: user1.privateKey};

      let utxos = _.map(_.range(event.payload.num_utxos), () => null);
      utxos[u] = uVal;

      return {
        seed: seed,
        n: 0,
        n_max: event.payload.n_max,
        utxos,
        name: 'WORKING'
      };
    }

    const rng = seedrandom('', {state: state.seed});
    rng();
    const seed = rng.state();
    const u = (rng.int32() & 0x7FFFFFFF) % state.utxos.length;

    const u_i1 = (rng.int32() & 0x7FFFFFFF) % users.length;
    const user1 = users[u_i1];

    
    let uVal;
    if(state.utxos[u] == null){
      const tx = await sawtooth.createTodoTx(user1.privateKey);
      uVal = {tx, length: 1, privatekey: user1.privateKey};
    }
    else{
      if(state.utxos[u].length > 10){
        uVal = null;
      }
      else{
        let pubK = JSON.parse(state.utxos[u].tx.transaction).output.owner;
        let user0 = _.find(users, o => o.publicKey === pubK);

        if(!user0){
          console.log('USER NOT FOUND');
        }

        const tx = await sawtooth.moveTodoTx(user0.privateKey, user1.privateKey, state.utxos[u].tx);
        uVal = {tx, length: state.utxos[u].length + 1, privatekey: user0.privateKey};
      }

    }

    return produce(state, s => {
      s.n = s.n + 1;
      if(s.n >= s.n_max){
        s.name = 'DONE';
        return;
      }
      s.utxos[u] = uVal;
      
      s.seed = seed;
    });
  },

  job: async (state) =>{

    const rng = seedrandom('', {state: state.seed});
    const u = (rng.int32() & 0x7FFFFFFF) % state.utxos.length;
    
    let utxo = state.utxos[u];
    if(utxo.length === 1){
      await sawtooth.sendCreateTodoTx(utxo.tx, utxo.privatekey);
    }
    else{
      await sawtooth.sendMoveTodoTx(utxo.tx, utxo.privatekey);
    }

    console.log('j', state.n);

  },
  locks: async (state) => {
    const rng = seedrandom('', {state: state.seed});
    let u = (rng.int32() & 0x7FFFFFFF) % state.utxos.length;
    return [u];
  }
}



function sleep(m){
  return new Promise((resolve) => setTimeout(resolve, m));  
}

