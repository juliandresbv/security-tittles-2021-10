require('dotenv').config();

const express = require('express');
const app = require('../app');
const mongo = require('../mongodb/mongo');
const {
  privKey1, 
  privKey2, 
  getPublicKey, 
  buildTransaction, 
  sleep,
  jwtSign,
  jwtVerify
} = require('./helper');
const request = require('supertest');
const _ = require('underscore');


//https://mochajs.org
//https://www.chaijs.com/guide/styles/#assert
const assert = require('chai').assert;

const jwtHeader = 'Bearer ' + jwtSign({publicKey: getPublicKey(privKey1)});


describe('POST /', ()=>{

  after(async () => {
    await mongo.close();
  });

  it('success', async ()=>{
    const msg = "hi there" + Math.random();

    let content = {
      type: 'todo',
      id: 10,
      
      input: null,
      output:{
        value:  msg,
        owner: getPublicKey(privKey1)
      }
    };

    let tx = await buildTransaction(content, privKey1);

    let res = await request(app)
      .post('/api/')
      .send(tx)
      .set('Authorization', jwtHeader)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);
      

    assert.deepEqual(res.body, {msg: "ok"});

    await sleep(1500);

    res = await request(app)
      .get(`/api/${tx.txid}`)
      .set('Authorization', jwtHeader)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);

    
    assert.deepEqual(res.body, {
      key: tx.txid,
      value: {value: msg, owner: getPublicKey(privKey1)}
    });

    res = await request(app)
      .get(`/api/${tx.txid}/history`)
      .set('Authorization', jwtHeader)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);

    assert.isTrue(res.body.length == 1);

    let t = _.omit(res.body[0], 'block_num', 'batch_id', 'transaction_id','block_id');

    assert.deepEqual(t, {
      _id: tx.txid,
      txid: tx.txid,
      idx: 0,
      input: null,
      root: tx.txid,
      payload: tx.transaction
    });
  
    assert.isTrue(res.body[0].block_num >= 0);
    assert.isNotNull(res.body[0].batch_id);
    assert.isNotNull(res.body[0].transaction_id);
    assert.isNotNull(res.body[0].block_id);



    //PUT

    let content2 = {
      type: 'todo',
      id: 10,
      
      input: tx.txid,
      output:{
        value:  msg,
        owner: getPublicKey(privKey2)
      }
    };

    let tx2 = await buildTransaction(content2, privKey1);


    res = await request(app)
      .put(`/api/`)
      .send(tx2)
      .set('Authorization', jwtHeader)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);

    assert.deepEqual(res.body, {msg: "ok"});


    await sleep(1500);

    res = await request(app)
      .get(`/api/${tx2.txid}`)
      .set('Authorization', jwtHeader)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);


    assert.deepEqual(res.body, {
      key: tx2.txid,
      value: {value: msg, owner: getPublicKey(privKey2)}
    });

    res = await request(app)
      .get(`/api/${tx.txid}/history`)
      .set('Authorization', jwtHeader)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(404);

    res = await request(app)
      .get(`/api/${tx2.txid}/history`)
      .set('Authorization', jwtHeader)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);

    assert.isTrue(res.body.length == 2);

    assert.deepEqual(_.omit(res.body[0], 'block_num', 'batch_id', 'transaction_id','block_id'), 
      {
        _id: tx2.txid,
        txid: tx2.txid,
        idx: 1,
        input: tx.txid,
        root: tx.txid,
        payload: tx2.transaction
      });
  
    assert.isTrue(res.body[0].block_num >= 0);
    assert.isNotNull(res.body[0].batch_id);
    assert.isNotNull(res.body[0].transaction_id);
    assert.isNotNull(res.body[0].block_id);

    assert.deepEqual(_.omit(res.body[1], 'block_num', 'batch_id', 'transaction_id','block_id'), 
      {
        _id: tx.txid,
        txid: tx.txid,
        idx: 0,
        input: null,
        root: tx.txid,
        payload: tx.transaction
      });
  
    assert.isTrue(res.body[1].block_num >= 0);
    assert.isNotNull(res.body[1].batch_id);
    assert.isNotNull(res.body[1].transaction_id);
    assert.isNotNull(res.body[1].block_id);


  }).timeout(10*1000);





});
