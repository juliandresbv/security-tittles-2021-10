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
  jwtVerify,
  randomPrivKey
} = require('./helper');
const request = require('supertest');
const _ = require('underscore');

const {sign} = require('../helpers/signature')

//https://mochajs.org
//https://www.chaijs.com/guide/styles/#assert
const assert = require('chai').assert;

const jwtHeader = 'Bearer ' + jwtSign({publicKey: getPublicKey(privKey1)});


describe('/api/auth', ()=>{

  before(async () => {
    await mongo.init();
  });

  after(async () => {
    await mongo.close();
  });

  it('/api/challange', async ()=>{
    let t1 = Date.now();
    let res = await request(app)
      .post('/api/auth/challange')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);
      
    assert.isNotNull(res.body.challange);

    let j = await jwtVerify(res.body.challange);
    assert.isTrue(j.challange >= t1);
  });

  it('/api/signup bad email', async ()=>{

    let res = await request(app)
      .post('/api/auth/challange')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);

    // let s = buildTransaction({email: "a@a.com", publicKey: getPublicKey(privKey1), challange: res.body.challange}, privKey1);
    let s = await buildTransaction({publicKey: getPublicKey(privKey1), challange: res.body.challange}, privKey1);

    res = await request(app)
      .post('/api/auth/signup')
      .send(s)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(401);

    assert.deepEqual(res.body, 'email is required')
  });

  it('/api/signup', async ()=>{
    let res = await request(app)
      .post('/api/auth/challange')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);

    const tx_data = {type: "auth/signup", email: "a@a.com", challange: res.body.challange, permissions:['client']};
    let s = await buildTransaction(tx_data, privKey1);

    res = await request(app)
      .post('/api/auth/signup')
      .send(s)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);

    assert.isNotNull(res.body.token);
    let j = await jwtVerify(res.body.token);
    assert.equal(j.publicKey, getPublicKey(privKey1));

    sleep(3000);

    res = await request(app)
      .get('/api/auth/whoami')
      .set('Authorization', 'Bearer ' + res.body.token)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);
    

    assert.deepEqual(res.body, {publicKey: getPublicKey(privKey1), permissions: tx_data.permissions, email: tx_data.email});

  }).timeout(20*1000);


  it('/api/signin with random key', async ()=>{

    let res = await request(app)
      .post('/api/auth/challange')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);

    const randomKey = randomPrivKey();
    let s = await buildTransaction({challange: res.body.challange}, randomKey);

    res = await request(app)
      .post('/api/auth/signin')
      .send(s)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(404);

    assert.deepEqual(res.body, 'publickey not registered')
  });


  it('/api/signin success', async ()=>{

    let res = await request(app)
      .post('/api/auth/challange')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);

    let tx_data = {type: "auth/signup", email: "a@a.com", challange: res.body.challange, permissions:['client']};
    let s = await buildTransaction(tx_data, privKey1);

    res = await request(app)
      .post('/api/auth/signup')
      .send(s)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);

    assert.isNotNull(res.body.token);
    let j = await jwtVerify(res.body.token);
    assert.equal(j.publicKey, getPublicKey(privKey1));

    sleep(2000);

    res = await request(app)
      .post('/api/auth/challange')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);

    tx_data = {type: "auth/signin", email: "a@a.com", challange: res.body.challange};
    s = await buildTransaction(tx_data, privKey1);

    res = await request(app)
      .post('/api/auth/signin')
      .send(s)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200);

    assert.isNotNull(res.body.token);
    j = await jwtVerify(res.body.token);

    assert.deepEqual(_.pick(j, 'publicKey', 'permissions'), {publicKey: getPublicKey(privKey1), permissions: ['client']});
  });

});