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


    let next_n;
    let next_n_max;
    let next_name;
    let next_seed;
    let next_utxos;

    let rng;
    let num_utxos;

    let _job;
    if(event && event.type === 'INIT'){
      next_n = 0;
      next_n_max = event.payload.n_max;
      rng = seedrandom('random seed', {state: true});
      num_utxos = event.payload.num_utxos;
    }
    else{
      next_n = state.n + 1;
      next_n_max = state.n_max;
      rng = seedrandom('', {state: state.seed});
      num_utxos = state.utxos.length;
    }

    rng();
    next_seed = rng.state();

    const u = (rng.int32() & 0x7FFFFFFF) % num_utxos;
    const u_i1 = (rng.int32() & 0x7FFFFFFF) % users.length;

    const user1 = users[u_i1];


    if(event && event.type === 'INIT'){
      const tx = await sawtooth.createTodoTx(user1.privateKey);
      next_utxos = _.map(_.range(event.payload.num_utxos), () => null);
      _job = {u, tx, privatekey: user1.privateKey};
    }
    else{
      next_utxos = state.utxos.slice();

      let prevU = state._job.u;

      let newLen = (state.utxos[prevU])? state.utxos[prevU].length + 1: 1;
      next_utxos[prevU] = {tx: state._job.tx, length: newLen, privatekey: state._job.privateKey};

      if(next_utxos[u] == null){
        const tx = await sawtooth.createTodoTx(user1.privateKey);
        _job = {u, tx, privatekey: user1.privateKey};
      }
      else{
        if(next_utxos[u].length > 10){
          next_utxos[u] = null;
          const tx = await sawtooth.createTodoTx(user1.privateKey);
          _job = {u, tx, privatekey: user1.privateKey};
        }
        else{
          let pubK = JSON.parse(next_utxos[u].tx.transaction).output.owner;
          let user0 = _.find(users, o => o.publicKey === pubK);
  
          if(!user0){
            console.log('USER NOT FOUND');
          }
  
          const tx = await sawtooth.moveTodoTx(user0.privateKey, user1.privateKey, next_utxos[u].tx);
          _job = {u, tx, privatekey: user0.privateKey};
        }
  
      }

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
      seed: next_seed,
      utxos: next_utxos,
      _job,
      _locks: [u]
    }
  },

  job: async (state) =>{

    const{u, tx, privatekey} = state._job;

    let utxo = state.utxos[u];
    if(utxo === null){
      await sawtooth.sendCreateTodoTx(tx, privatekey);
    }
    else{
      await sawtooth.sendMoveTodoTx(tx, privatekey);
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

