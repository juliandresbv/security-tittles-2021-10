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

async function main(){
  try{
    if(from0){
      await fsPromises.unlink('./log.txt');
      await fsPromises.unlink('./users.txt');
    }

    await generateUserFile(1000);

    await jobExecutor(stateMachine, n_max);

  }
  catch(err){
    console.log(err);
  }
}


main();
