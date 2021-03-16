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
  console.log('node ./scripts/signup.js 1');
  return;
}


const publicKey = getPublicKey(privKey);
const jwtHeader = {headers: {"Authorization":"Bearer " + jwtSign({publicKey: getPublicKey(privKey)})}};

(async () => {

  let res = await axios.post('http://localhost:3001/auth/challange');

  let tx = await buildTransaction({type: "auth/signin", email: "a@a.com", publicKey: getPublicKey(privKey1), challange: res.data.challange, permissions:['client']}, privKey1);

  try{

    let res = await axios.post('http://localhost:3001/auth/signup', tx, jwtHeader);
    console.log(res.data);
    console.log(tx.txid)
  }
  catch(err){
    console.log(err);
  }
})();
