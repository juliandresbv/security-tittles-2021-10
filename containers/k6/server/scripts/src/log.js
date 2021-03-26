const FILE = './log.txt';
const fs = require('fs');
const fsPromises = require('fs').promises;
const readline = require('readline');


let filePromise = null;
let last_line = null;

async function init(){
  if(!filePromise){
    last_line = await _lastLog();
    filePromise = fsPromises.open(FILE, 'a');
  }
  else{
    console.log('init() called twice')
  }
}

async function close(){
  if(filePromise){
    const f = await filePromise;
    f.close();
  }
  else{
    console.log('called closed without initialization')
  }
}

async function log(line){
  const f = await filePromise;
  f.write(line+'\n');
}

async function lastLog(){
  if(filePromise){
    await filePromise;
  }
  return last_line;
}

async function _lastLog() {
  if(!await fileExists(FILE)){
    return null;
  }

  return new Promise((resolve, reject) =>{
    const rl = readline.createInterface({
      input: fs.createReadStream(FILE),
      crlfDelay: Infinity
    });

    let lastLine = null;
    rl.on('line', (line) => {
      lastLine = line;
    });

    rl.on('close', (line) => {
      resolve(lastLine);
    });
  });
}


async function fileExists(file){
  try{
    const s = await fsPromises.access(file, fs.constants.F_OK);
    return true;
  }
  catch(err){
    return false;
  }
}

module.exports = {init, close, log, lastLog}