//https://mochajs.org
//https://www.chaijs.com/guide/styles/#assert
const assert = require('chai').assert;

const TPHandler = require('../src/handler')
const contextMock = require('../src/helpers/contextMock')


describe('simple', ()=>{
  it('constants are defined', ()=>{
    assert.equal(TPHandler.TP_FAMILY, 'todos');
    assert.equal(TPHandler.TP_VERSION, '1.0');
    assert.equal(TPHandler.TP_NAMESPACE.length, 6);
  })

  it('address works', ()=>{
    assert.equal(TPHandler.addresses.length, 1);
    assert.equal(TPHandler.addresses[0]('some key').length, 70);
    assert.equal(TPHandler.addresses[0]('some key').slice(0,6), TPHandler.TP_NAMESPACE);
  })
});

describe('post handler', ()=>{
  
  it('type not todo', async ()=>{
    let contexts = [contextMock()];
    try{
      const data = {type: 'something'};
      await TPHandler.handlers.post(contexts, {transaction: JSON.stringify(data)})
      assert.fail('Should Throw');
    }
    catch(e){
      assert.equal(e.message, 'type must be todo')
    }
  })

  it('no id', async ()=>{
    let contexts = [contextMock()];
    try{
      const data = {type: 'todo'};
      await TPHandler.handlers.post(contexts, {transaction: JSON.stringify(data)})
      assert.fail('Should Throw');
    }
    catch(e){
      assert.equal(e.message, 'id is required')
    }
  })

  it('input not null', async ()=>{
    let contexts = [contextMock()];
    try{
      const data = {type: 'todo', id: 1, input: "123"};
      await TPHandler.handlers.post(contexts, {transaction: JSON.stringify(data)})
      assert.fail('Should Throw');
    }
    catch(e){
      assert.equal(e.message, 'input must be null');
    }
  })

  it('ok', async ()=>{
    let contexts = [contextMock()];
    const data = {type: 'todo', id: 1, input: null, output: {owner: '123', value: 1}};
    const txid = '1223'
    await TPHandler.handlers.post(contexts, {transaction: JSON.stringify(data), txid});

    assert.deepEqual(contexts[0]._state[txid], data.output);
  })

});

describe('put handler', ()=>{
  
  it('type not todo', async ()=>{
    let contexts = [contextMock()];
    try{
      const data = {type: 'something'};
      await TPHandler.handlers.put(contexts, {transaction: JSON.stringify(data)})
      assert.fail('Should Throw');
    }
    catch(e){
      assert.equal(e.message, 'type must be todo')
    }
  })

  it('no input', async ()=>{
    let contexts = [contextMock()];
    try{
      const data = {type: 'todo'};
      await TPHandler.handlers.put(contexts, {transaction: JSON.stringify(data)})
      assert.fail('Should Throw');
    }
    catch(e){
      assert.equal(e.message, 'input must not be null')
    }
  })

  it('UTXO does not exist', async ()=>{
    let contexts = [contextMock()];
    try{
      const data = {type: 'todo', input: '123'};
      await TPHandler.handlers.put(contexts, {transaction: JSON.stringify(data)})
      assert.fail('Should Throw');
    }
    catch(e){
      assert.equal(e.message, 'UTXO does not exist')
    }
  })

  it('not owner of UTXO', async ()=>{
    let contexts = [contextMock()];
    try{
      const txid0 = '000'
      contexts[0]._state[txid0] = {owner: '007', value: 1};
      contexts[0].publicKey = '008';

      const data = {type: 'todo', input: txid0};
      await TPHandler.handlers.put(contexts, {transaction: JSON.stringify(data)})
      assert.fail('Should Throw');
    }
    catch(e){
      assert.equal(e.message, 'not owner of UTXO')
    }
  })

  it('ok', async ()=>{
    let contexts = [contextMock()];
    const txid0 = '000'
    contexts[0]._state[txid0] = {owner: '007', value: 1};
    contexts[0].publicKey = '007';

    const data = {type: 'todo', input: txid0, output:{owner: '008', value: 1}};
    const txid = '111';
    

    await TPHandler.handlers.put(contexts, {transaction: JSON.stringify(data), txid});
    assert.deepEqual(contexts[0]._state[txid], data.output);

    // assert.deepEqual(contexts[0]._events[0].slice(0,3), ["myevent", [['name', 'handlerCalled']], Buffer.from("event", "utf8")]);
  })

});