require('dotenv').config();

const axios = require('axios');

const {
  getPublicKey, 
  buildTransaction, 
  jwtSign,
  randomPrivKey
} = require('../helper/helper');

async function createTodoTx(pk){

  const privateKey = Buffer.from(pk, 'hex');
  const msg = "msg-" + Math.random();

  let content = {
    type: 'todo',
    id: 10,
    
    input: null,
    output:{
      value:  msg,
      owner: getPublicKey(privateKey)
    }
  };

  let tx = await buildTransaction(content, privateKey);
  return tx;
}

async function sendCreateTodoTx(tx, pk){
  const privateKey = Buffer.from(pk, 'hex');
  const jwtHeader = {headers: {"Authorization":"Bearer " + jwtSign({
    publicKey: getPublicKey(privateKey),
    permissions: ['client']
  })}};
  
  await axios.post(`${process.env.SERVER_HOST}/api/todo`, tx, jwtHeader);
}

async function moveTodoTx(pk1, pk2, tx){

  const privateKey1 = Buffer.from(pk1, 'hex');
  const privateKey2 = Buffer.from(pk2, 'hex');

  const msg = "msg-" + Math.random();

  let content = {
    type: 'todo',
    id: 10,
    
    input: tx.txid,
    output:{
      value:  msg,
      owner: getPublicKey(privateKey2)
    }
  };

  let tx2 = await buildTransaction(content, privateKey1);
  return tx2;
}

async function sendMoveTodoTx(tx, pk){
  const privateKey = Buffer.from(pk, 'hex');
  const jwtHeader = {headers: {"Authorization":"Bearer " + jwtSign({
    publicKey: getPublicKey(privateKey),
    permissions: ['client']
  })}};
  
  await axios.put(`${process.env.SERVER_HOST}/api/todo`, tx, jwtHeader);
}


module.exports = {createTodoTx, sendCreateTodoTx, moveTodoTx, sendMoveTodoTx}