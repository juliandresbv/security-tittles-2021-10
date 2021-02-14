//https://mochajs.org
//https://www.chaijs.com/guide/styles/#assert
const assert = require('chai').assert;

const TPHandler = require('../src/handler')
const contextMock = require('../src/helpers/contextMock')


describe('simple', ()=>{
  it('constants are defined', ()=>{
    assert.equal(TPHandler.TP_FAMILY, 'intkey');
    assert.equal(TPHandler.TP_VERSION, '1.0');
    assert.equal(TPHandler.TP_NAMESPACE.length, 6);
  })

  it('address works', ()=>{
    assert.equal(TPHandler.address('some key').length, 70);
    assert.equal(TPHandler.address('some key').slice(0,6), TPHandler.TP_NAMESPACE);
  })
});

describe('put handler', ()=>{
  it('no id', async ()=>{
    let context = contextMock();
    try{
      await TPHandler.handlers.put(context, {value:'value1'})
      assert.fail('Should Throw');
    }
    catch(e){
      assert.equal(e.message, 'id is required')
    }
  })

  it('no value', async ()=>{
    let context = contextMock();
    try{
      await TPHandler.handlers.put(context, {id: 'id1'})
      assert.fail('Should Throw');
    }
    catch(e){
      assert.equal(e.message, 'value is required')
    }
  })

  it('ok', async ()=>{
    let context = contextMock();
    await  TPHandler.handlers.put(context, {id:"key1", value:'value1'})
    assert.equal(context._state['key1'], 'value1');
    assert.deepEqual(context._events[0].slice(0,3), ["myevent", [['name', 'handlerCalled']], Buffer.from("event", "utf8")]);
  })

});