const crypto = require('crypto');
const assert = require('chai').assert;

const {getState, putState, deleteState} = require('../../src/helpers/TPKeyHandler.js');
const _ = require('underscore');

const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const TP_FAMILY = 'intkey';
const TP_NAMESPACE = hash512(TP_FAMILY).substring(0, 6)


const addressIntKey = (key) => {
  let k = key.slice(0,2); //Only first 2 chars
  return TP_NAMESPACE + hash512(k).slice(-64)
}

const makeContext = () => {
  let state = {};
  return {
    setState: async (addresses) =>{
      _.mapObject(addresses,  (val, key)=>{
        state[key] = val;
      });
      return _.map(addresses, (val, key) =>{
        return key;
      });
    },
    getState: async (addresses)=>{
      let res = {};
      _.each(addresses, (a) => {
        res[a] = state[a]; 
      });
      return res;
    },
    deleteState: async(addresses) => {
      _.each(addresses, (a) => {
        delete state[a];
      });
      return addresses;
    },  
    state
  }
};

describe('TPKeyHandler', ()=>{
  it('putState once ', async()=>{
    const context = makeContext();
    const KEY = "1";
    const VAL = "val1";

    await putState(context, addressIntKey, KEY, VAL);
    assert.deepEqual(context.state[addressIntKey(KEY)], 
      Buffer.from(JSON.stringify([{key: KEY, value: VAL}]), 'utf8')
    );

    let s = await getState(context, addressIntKey, KEY)
    assert.deepEqual(s, "val1");
  });

  it('putState twice', async()=>{
    const context = makeContext();
    const KEY = "11";
    const VAL = "val1";

    await putState(context, addressIntKey, KEY, VAL);
    await putState(context, addressIntKey, "111", "val2");

    assert.deepEqual(context.state[addressIntKey(KEY)], 
      Buffer.from(JSON.stringify(
        [{key: KEY, value: VAL}, {key: "111", value: "val2"}]
      ), 'utf8')
    );

    let s = await getState(context, addressIntKey, KEY)
    assert.deepEqual(s, "val1");

    let s2 = await getState(context, addressIntKey, '111')
    assert.deepEqual(s2, "val2");


    await deleteState(context, addressIntKey, KEY);
    assert.deepEqual(context.state[addressIntKey('111')], 
      Buffer.from(JSON.stringify(
        [{key: "111", value: "val2"}]
      ), 'utf8')
    );

    s2 = await getState(context, addressIntKey, '111')
    assert.deepEqual(s2, "val2");

    await deleteState(context, addressIntKey, '111');
    assert.deepEqual(context.state, 
      {}
    );

  });
});
