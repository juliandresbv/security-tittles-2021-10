require('dotenv').config()

const _ = require('underscore');
const { default: axios } = require("axios");


const {
  privKey1, 
  privKey2, 
  getPublicKey, 
  buildTransaction, 
  sleep,
  jwtSign,
  jwtVerify
} = require('../test/helper');

let privKey;

if(process.argv[2] == 1){
  privKey = privKey1;
}
else if(! _.isUndefined(process.argv[2])){
  privKey = privKey2;
}
else{
  console.log('Use:');
  console.log('node ./scripts/post.js 1 message');
  return;
}

let message = "default message";
if(process.argv[3]){
  message = process.argv[3];
}

const publicKey = getPublicKey(privKey);
const jwtHeader = {headers: {"Authorization":"Bearer " + jwtSign({publicKey: getPublicKey(privKey), permissions:['client']})}};

(async () => {

  const payload1 = {
    type: 'todo',
    id: 10,
    
    input: null,
    output:{
      value: message + "3",
      owner: publicKey
    }
  };
  const payload2 = {
    type: 'todo',
    id: 10,
    
    input: null,
    output:{
      value: message,
      owner: publicKey
    }
  };

  const tx = await buildTransaction(payload1, privKey);

  try{
    let res = await axios.post('http://localhost:3001/api/todo', tx, jwtHeader);
    console.log(res.data);
    console.log('txid:', tx.txid)
  }
  catch(err){
    console.log(err);
  }
})();
