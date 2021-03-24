'use strict';

const fs = require('fs');
const fsPromises = require('fs').promises;
const _ = require('underscore');
const randomUser = require('./randomUser');



const readline = require('readline');
const delay = require('delay');
const axios = require('axios').default;

const FILE = './performance/log.txt';
const STEP = 100;
const DELAY_BETWEEN_TRIES = 10*1000;//ms

const arg1 = process.argv[2];
const arg2 = process.argv[3];

if(_.isUndefined(arg1) || _.isUndefined(arg2) || parseInt(arg1,10) < 0 || parseInt(arg2,10) < 0){
  console.log("Usage:");
  console.log("node ./batchCreate.js <idStart> <numberToInsert>");
  return;
}

const idStart = parseInt(arg1);
const numberToInsert = parseInt(arg2);

let lastIdx;



function getLastIdRead() {
  return fsPromises.open(FILE, 'r')
  .then((file)=>{
    return file.close();
  })
  .catch((err)=>{
    if(err.errno == -2){
      console.log('No log File');
      let f2;
      return fsPromises.open(FILE, 'a')
        .then((file)=>{
          f2 = file;
          return f2.write('START\r\n'+ idStart + ',' + 0 +'\r\n');
        })
        .then(()=>{
          return f2.close();
        });
    }
    else{
      throw err;
    }
  })
  .then(()=>{
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
  })
  .then((lastLine)=>{ //Read last line
    lastIdx = parseInt(lastLine.split(',')[0], 10);
    console.log('LastIndex:', lastIdx);
    return lastIdx;
  });
}

function sendRequests({file, idx, step}){
  if(idx + 1 <= idStart+numberToInsert){
    let realStep = Math.min(step, idStart+numberToInsert - idx);
    let start = (new Date()).getTime();
    return sendNRequests(idx + 1, realStep)
      .then((res) => {
        let end = (new Date()).getTime();
        return file.write((idx + realStep) + ',' + (end - start) + '\r\n');
      })
      .then(()=>{
        return file.datasync();
      })
      .then(()=>{
        return sendRequests({file, idx:idx + realStep, step});
      });
  }
  else{
    return Promise.resolve();
  }
}

function sendNRequests(min, n){
  let promises = [];
  for(let m = min; m < min + n; m++){
    promises.push(
      axios.post('http://localhost:3001/api/v1/donors/', randomUser(m))
    );
  }
  return Promise.all(promises);
}

//==============================================
//Only for tests
// let errCount = 0;
// function sendNRequests(min, n){
//   let promises = [];
//   for(let m = min; m < min + n; m++){
//     errCount++;
//     if(errCount%10 == 0){
//       promises.push(Promise.reject("Intentional error"));
//     }
//     else{
//       promises.push(delay(10));
//     }
//     console.log("m:", m);
//   }
//   return Promise.all(promises);
// }
//===============================================

function work(){
  let appendFile;
  return getLastIdRead()
  .then((idx)=>{
    lastIdx = idx;
    return fsPromises.open(FILE, 'a');
  })
  .then((file)=>{
    appendFile = file;
    return sendRequests({file, idx:lastIdx, step:STEP});
  })
  .then(()=>{
    if(appendFile){
      return appendFile.close();
    }
    return;
  });
}


let start = (new Date()).getTime();
let finished = false;
let num_errors = 0;

function workUntilFinish(){
  return work()
  .then(()=>{
    let end = (new Date()).getTime();
    console.log('END:', (end-start)/1000,'s');
    finished = true;
  })
  .catch((err)=>{
    num_errors++;
    console.log('#######  Num err:', num_errors);
    // console.log(err);
    return delay(DELAY_BETWEEN_TRIES)
      .then(()=>{
        return workUntilFinish();
      });
  });
}

workUntilFinish();