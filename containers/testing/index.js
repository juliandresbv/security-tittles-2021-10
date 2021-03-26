// const jobExecutor = require('./src/serialExecutor');
const jobExecutor = require('./src/parallelExecutor');

const stateMachine = require('./src/stateMachine');
// const stateMachine = require('./src/users/stateMachine');
const fsPromises = require('fs').promises;
const {generateUserFile} = require('./src/users/signup');

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
  console.log("node ./batchCreate.js <num_iters> --from0");
  return;
}

let executor;

async function main(){
  try{
    if(from0){
      await fsPromises.unlink('./log.txt');
      await fsPromises.unlink('./users.txt');
    }
  }
  catch(err){
    // console.log(err);
  }

  try{
    await generateUserFile(n_max);

    executor = await jobExecutor(stateMachine, n_max);
    await executor.executePromise;

  }
  catch(err){
    console.log(err);
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

