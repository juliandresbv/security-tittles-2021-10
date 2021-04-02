const fs = require('fs');
const fsPromises = require('fs').promises;
const readline = require('readline');

module.exports = (FILE) => {
  let fileHandler = null;
  let last_line = null;

  async function init(){
    if(!fileHandler){
      last_line = await _lastLog();
      fileHandler = await fsPromises.open(FILE, 'a');
    }
    else{
      console.log('init() called twice')
    }
  }

  async function close(){
    if(fileHandler){
      fileHandler.close();
    }
    else{
      console.log('called closed without initialization')
    }
  }

  async function log(line){
    fileHandler.write(line+'\n');
  }

  async function lastLog(){
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

  return {init, close, log, lastLog};
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