require('dotenv').config();
const _ = require('underscore');
const seedrandom = require('seedrandom');


//https://mochajs.org
//https://www.chaijs.com/guide/styles/#assert
const assert = require('chai').assert;

const stateMachine = require('../../../../scripts/src/user/stateMachine')

describe('user stateMachine', ()=>{

  before(async () => {
  });

  after(async () => {
  });

  it('init', async ()=>{
    let state = stateMachine.apply(null, {type: 'INIT', payload: 2});
    assert.deepEqual(_.omit(state, 'seed'), {n:0, n_max: 2, name: 'WORKING'});
  });

  it('state 1', async ()=>{
    const rng = seedrandom('random seed', {state: true});

    let state = stateMachine.apply({seed: rng.state(), n:0, n_max: 2});
    assert.deepEqual(_.omit(state, 'seed'), {n:1, n_max: 2, name: 'WORKING'});
  });

  it('state 2', async ()=>{
    const rng = seedrandom('random seed', {state: true});

    let state = stateMachine.apply({seed: rng.state(), n:1, n_max: 2});
    assert.deepEqual(_.omit(state, 'seed'), {n:2, n_max: 2, name: 'DONE'});
  });


});