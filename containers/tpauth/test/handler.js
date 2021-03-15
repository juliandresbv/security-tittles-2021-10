//https://mochajs.org
//https://www.chaijs.com/guide/styles/#assert
const assert = require('chai').assert;

const TPHandler = require('../src/handler')
const contextMock = require('../src/helpers/contextMock')


describe('simple', ()=>{
  it('constants are defined', ()=>{
    assert.equal(TPHandler.TP_FAMILY, 'auth');
    assert.equal(TPHandler.TP_VERSION, '1.0');
    assert.equal(TPHandler.TP_NAMESPACE.length, 6);
  })

  it('address works', ()=>{
    assert.equal(TPHandler.addresses.length, 1);
    assert.equal(TPHandler.addresses[0]('some key').length, 70);
    assert.equal(TPHandler.addresses[0]('some key').slice(0,6), TPHandler.TP_NAMESPACE);
  })
});

describe('put handler', ()=>{

  it('no publickKey', async ()=>{
    let contexts = [contextMock()];
    try{
      await TPHandler.handlers.put(contexts, {transaction: JSON.stringify({type:'other type'})})
      assert.fail('Should Throw');
    }
    catch(e){
      assert.equal(e.message, 'type must be auth')
    }
  });

  it('no publickKey', async ()=>{
    let contexts = [contextMock()];
    try{
      await TPHandler.handlers.put(contexts, {transaction: JSON.stringify({type:'auth'})})
      assert.fail('Should Throw');
    }
    catch(e){
      assert.equal(e.message, 'publicKey must be a string')
    }
  });


  it('no publickKey', async ()=>{
    let contexts = [contextMock()];
    try{
      await TPHandler.handlers.put(contexts, {transaction: JSON.stringify({type:'auth', publicKey:'pk1'})})
      assert.fail('Should Throw');
    }
    catch(e){
      assert.equal(e.message, 'permissions must be an [] of strings')
    }
  });


  it('ok', async ()=>{
    let contexts = [contextMock()];
    const data = {type:'auth', publicKey:'pk1', permissions: ['do1', 'do2']};
    await TPHandler.handlers.put(contexts, {transaction: JSON.stringify(data)});

    assert.deepEqual(contexts[0]._state[data.publicKey], data.permissions);
  });


});