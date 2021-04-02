require('dotenv').config();
const _ = require('underscore');

//https://mochajs.org
//https://www.chaijs.com/guide/styles/#assert
const assert = require('chai').assert;
const serialExecutor = require('../../../scripts/src/serialExecutor')
const stateMachineBuilder = require('../../mockStateMachineBuilder');
const mockLogger = require('../../mockLogger');

describe('serialExecutor', ()=>{

  before(async () => {
  });

  after(async () => {
  });

  it('n_max = 0', async ()=>{
    let logger = mockLogger();
    let sm = stateMachineBuilder();

    const {executePromise, close } = await serialExecutor(sm, {type: 'INIT', payload: 0}, logger);

    await executePromise;

    assert.deepEqual(logger._logs, []);
    assert.deepEqual(sm._jobs, []);
  });

  it('n_max = 1', async ()=>{
    let logger = mockLogger();
    let sm = stateMachineBuilder();

    const {executePromise, close } = await serialExecutor(sm, {type: 'INIT', payload: 1}, logger);

    await executePromise;

    assert.deepEqual(_.map(logger._logs, n => JSON.parse(n)), [{n: 0, n_max: 1, name: 'WORKING', _locks: [0]}]);
    assert.deepEqual(_.map(sm._jobs, j => j.n), [0]);
  });

  it('n_max = 2', async ()=>{
    let logger = mockLogger();
    let sm = stateMachineBuilder();

    const {executePromise, close } = await serialExecutor(sm, {type: 'INIT', payload: 2}, logger);

    await executePromise;

    assert.deepEqual(_.map(logger._logs, n => JSON.parse(n)), [
      {n: 1, n_max: 2, name: 'WORKING', _locks: [1]},
    ]);
    assert.deepEqual(_.map(sm._jobs, j => j.n), [
      0, 1
    ]);
  });

});