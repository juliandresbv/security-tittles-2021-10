require('dotenv').config()

var _ = require('underscore');
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

let prKey1;
let prKey2;

if(process.argv[2] == 1){
  prKey1 = privKey1;
  prKey2 = privKey2;
    
}
else if(! _.isUndefined(process.argv[2])){
  prKey1 = privKey2;
  prKey2 = privKey1;
}

let transactionId;
if(process.argv[3]){
  transactionId = process.argv[3];
}
else{
  console.log('Use:');
  console.log('node ./scripts/put.js 1 0xhashoftransaction');
  return;
}


const publicKey2 = getPublicKey(prKey2);

const jwtHeader = {headers: {"Authorization":"Bearer " + jwtSign({publicKey: getPublicKey(prKey1), permissions:['client']})}};


(async () => {

  const payload = {
    type: 'todo',
    
    input: transactionId,
    output:{
      value: 'new value',
      owner: publicKey2
    }
  };

  let tx = await buildTransaction(payload, prKey1)
  console.log('txid:', tx.txid)

  try{
    let res = await axios.put(`http://localhost:3001/api/todo`, tx, jwtHeader);
    console.log(res.data);
  }
  catch(err){
    console.log(err.message);
    console.log(err.response.data);

  }

})();
