const jobExecutor = require('./src/serialExecutor');
// const stateMachine = require('./src/stateMachine');
const stateMachine = require('./src/users/stateMachine');
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

let close;

async function main(){
  try{
    if(from0){
      await fsPromises.unlink('./log.txt');
      await fsPromises.unlink('./users.txt');
    }
  }
  catch(err){
    console.log(err);
  }

  try{
    await generateUserFile(n_max);

    let r = await jobExecutor(stateMachine, n_max);
    close = r.close;

    await r.executePromise;
    close = null;

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
  if(close){
    close();
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

