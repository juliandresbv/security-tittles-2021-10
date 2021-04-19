require('dotenv').config()
const mongo = require('./src/mongodb/mongo');
const sawtoothHelper = require('./src/sawtooth/sawtooth-helpers');
const mongoEventHandlerBuilder = require('./src/sawtooth/mongoEventHandlerBuilder')

const {events, handlers} = require('./src/index');

(async () => {
  await mongo.init();
  let lastBlock = await mongoEventHandlerBuilder.lastBlockId(); 
  
  sawtoothHelper.subscribeToSawtoothEvents(
    sawtoothHelper.deltaEventsForSubscription(events), 
    sawtoothHelper.decodedHandler(mongoEventHandlerBuilder.create(handlers)), 
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
  // process.kill(process.pid, 'SIGUSR2');
  process.exit(0);
});
