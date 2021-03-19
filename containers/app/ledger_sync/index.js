require('dotenv').config()
const mongo = require('./src/mongodb/mongo');
const sawtoothHelper = require('./src/sawtooth/sawtooth-helpers');
const mongoEventHandler = require('./src/sawtooth/mongoEventHandler')
const _ = require('underscore');

const {events, hand} = require('./src/index');

(async () => {
  await mongo.client();
  let lastBlock = await mongoEventHandler.lastBlockId(); 
  sawtoothHelper.subscribeToSawtoothEvents(
    sawtoothHelper.deltaEventsForSubscription(events), 
    sawtoothHelper.decodedHandler(mongoEventHandler.create(hand)), 
    lastBlock);
})();


let startshutdown = false;
async function shutdown(){
  if(startshutdown){
    return;
  }
  startshutdown = true;

  return new Promise((resolve, reject) => {
    let end = false;
    const finish = (err) => {
      if(!end){
        if(err){
          console.log(err.message);
          resolve();
        }
        console.log('shut down normally');
        resolve();
      }
      end = true;
    };

    (async () => {
      await mongo.close();
      await sawtoothHelper.close();
      finish();
    })();

    setTimeout(() => finish(new Error('Timeout')), 2000);
  });  
}

process.on('SIGINT', async () => {
  // await console.log('SIGINT')
  await shutdown();
  // process.kill(process.pid, 'SIGUSR2');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await shutdown();
  // process.kill(process.pid, 'SIGUSR2');
  process.exit(0);
});

process.once('SIGUSR2', async () => {
  await shutdown();
  console.log('kill');
  // process.kill(process.pid, 'SIGUSR2');
  process.exit(0);
});
