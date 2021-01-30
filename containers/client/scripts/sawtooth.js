require('dotenv').config();

const {
  sendTransaction, 
  queryState, 
  subscribeToSawtoothEvents} = require('../sawtooth/sawtooth-helpers');

const TRANSACTION_FAMILY = 'intkey';

(async () =>{
  let response = await sendTransaction(TRANSACTION_FAMILY , {
    Action: 'set',
    Name: 'foo',
    Value: 41
  })
  console.log(response.data);

  await new Promise((resolve) => {
    setTimeout(resolve, 5000);
  });

  let value = await queryState(TRANSACTION_FAMILY, 'foo');
  console.log(value);
  
  process.exit(0);  //Should probably unsubscribe first
})();



subscribeToSawtoothEvents();