const jobExecutor = require('./src/serialExecutor');
// const jobExecutor = require('./src/parallelExecutor');

// const stateMachine = require('./src/stateMachine');
// const stateMachine = require('./src/users/stateMachine');
const stateMachine = require('./src/todo/stateMachine');

const loggerBuilder = require('./src/logger');

const fsPromises = require('fs').promises;

let args = process.argv.slice(2)

let from0 = false;
let n_max = null;
while(args.length > 0){
  let a = args.shift();
  if(a === '--from0'){
    from0 = true;
  }
  else{
    n_max = parseInt(a, 10);
  }
}

if(n_max == null){
  console.log("Usage:");
  console.log("node ./index2.js <num_iters> --from0");
  return;
}

let executor;

async function main(){
  try{
    if(from0){
      await fsPromises.unlink('./log2.txt');
    }
  }
  catch(err){
    // console.log(err);
  }

  let logger;
  try{
    logger = loggerBuilder('./log2.txt');
    await logger.init();


    executor = await jobExecutor(stateMachine, {type: "INIT", payload: {n_max, num_utxos: 100}}, logger);
    await executor.executePromise;

  }
  catch(err){
    console.log(err);
  }
  finally{
    if(logger){
      await logger.close();
    }
  }
}


main();


let startshutdown = false;
async function shutdown(){
  if(startshutdown){
    return;
  }
  startshutdown = true;
  if(executor){
    executor.close();

    await Promise.race([
      executor.executePromise,
      new Promise((resolve) => setTimeout(resolve, 1*1000))
    ]);
    executor = null;
  }

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

