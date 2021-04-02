require('dotenv').config();
const _ = require('underscore');

//https://mochajs.org
//https://www.chaijs.com/guide/styles/#assert
const assert = require('chai').assert;
const executor = require('../../../scripts/src/parallelExecutor')
const stateMachineBuilder = require('../../mockStateMachineBuilder');
const mockLogger = require('../../mockLogger');

describe('parallelExecutor', ()=>{

  before(async () => {
  });

  after(async () => {
  });

  it('n_max = 0', async ()=>{
    let logger = mockLogger();
    let sm = stateMachineBuilder();

    const initialState = sm.apply(null, {type: 'INIT', payload: 0});
    const {executePromise, close } = await executor(sm, initialState, logger, 2);

    await executePromise;

    assert.deepEqual(logger._logs, []);
    assert.deepEqual(sm._jobs, []);
  });

  it('n_max = 1', async ()=>{
    let logger = mockLogger();
    let sm = stateMachineBuilder();

    const initialState = sm.apply(null, {type: 'INIT', payload: 1});
    const {executePromise, close } = await executor(sm, initialState, logger, 2);

    await executePromise;

    assert.deepEqual(_.map(logger._logs, n => JSON.parse(n)), [
      {n: 0, n_max: 1, name: 'WORKING', _locks: [0]}
    ]);
    assert.deepEqual(_.map(sm._jobs, j => j.n), [0]);
  });

  it('n_max = 2', async ()=>{
    let logger = mockLogger();
    let sm = stateMachineBuilder([
      [-10, 200],
      [-50, -1, 50]
    ]);

    const initialState = sm.apply(null, {type: 'INIT', payload: 2});
    const {executePromise, close } = await executor(sm, initialState, logger, 2);

    await executePromise;

    assert.deepEqual(_.map(logger._logs, n => JSON.parse(n)), [
      {n: 1, n_max: 2, name: 'WORKING', _locks: [1]},
    ]);
    assert.deepEqual(_.map(sm._jobs, j => j.n), [
      0, 1, 0, 1, 1
    ]);
  }).timeout(5*1000);

  it('n_max = 4, lock test', async ()=>{
    let logger = mockLogger();
    let sm = stateMachineBuilder([
      [5],
      [1],
      [1],
      [1],
    ]);

    const initialState = sm.apply(null, {type: 'INIT', payload: 4});
    const {executePromise, close } = await executor(sm, initialState, logger, 2);

    await executePromise;

    assert.deepEqual(_.map(logger._logs, n => JSON.parse(n)), [
      {n: 2, n_max: 4, name: 'WORKING', _locks: [2]},
      {n: 3, n_max: 4, name: 'WORKING', _locks: [3]},
    ]);
    assert.deepEqual(_.map(sm._jobs, j => j.n), [
      0, 1, 2, 3
    ]);
  }).timeout(5*1000);

});