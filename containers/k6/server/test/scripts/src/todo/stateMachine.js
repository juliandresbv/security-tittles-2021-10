require('dotenv').config();
const _ = require('underscore');
const seedrandom = require('seedrandom');
const fsPromises = require('fs').promises;
const {generateUserFile, readUsersFromFile} = require('../../../../scripts/src/user/signup');


//https://mochajs.org
//https://www.chaijs.com/guide/styles/#assert
const assert = require('chai').assert;

const stateMachine = require('../../../../scripts/src/todo/stateMachine')

let users;

describe('user stateMachine', ()=>{

  before(async () => {
    await fsPromises.unlink('./users.txt');
    await generateUserFile(10);
    users = await readUsersFromFile();
  });

  after(async () => {
  });

  it('init', async ()=>{
    let state = await stateMachine.apply(null, {type: 'INIT', payload: {n_max: 2, num_utxos: 4}});
    assert.deepEqual(_.omit(state, 'seed', 'utxos'), {n:0, n_max: 2, name: 'WORKING'});

    assert.equal(state.utxos.length, 4);
    let added = _.filter(state.utxos, s => s !== null);

    assert.isTrue(added.length == 1);
    assert.isTrue(added[0].length == 1);
    assert.containsAllKeys(added[0], ['tx', 'privatekey'])
  });

  it('state 2', async ()=>{
    let state0 = await stateMachine.apply(null, {type: 'INIT', payload: {n_max: 4, num_utxos: 2}});


    let state1 = await stateMachine.apply(state0);
    validateStep(state0, state1);

    let state2 = await stateMachine.apply(state1);
    validateStep(state1, state2);

    let state3 = await stateMachine.apply(state2);
    validateStep(state2, state3);

    let state4 = await stateMachine.apply(state3);
    assert.isTrue(state4.name === 'DONE');


    function validateStep(s0, s1){
      let idx = findIdxOfDifference(s0.utxos, s1.utxos);

      if(s0.utxos[idx] == null){
        assert.isTrue(s1.utxos[idx] !== null);
        assert.isTrue(s1.utxos[idx].length === 1);
      }
      else{
        let tx1 = JSON.parse(s1.utxos[idx].tx.transaction);
        assert.equal(tx1.input, s0.utxos[idx].tx.txid);
        assert.equal(s1.utxos[idx].length, s0.utxos[idx].length + 1);
      }
    }

  });


});


function findIdxOfDifference(u1, u2){
  for(let n = 0; n < u1.length; n ++){
    if(
      (u1[n] == null && u2[n] !== null) ||
      (u1[n] !== null && u2[n] == null) ||
      (u1[n].length !== u2[n].length)
    ){
      return n;
    }
  }
  return -1;

}