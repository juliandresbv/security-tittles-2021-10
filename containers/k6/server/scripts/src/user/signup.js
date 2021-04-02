require('dotenv').config()

const _ = require('underscore');
const { default: axios } = require("axios");
const Chance = require('chance');
const chance = new Chance();
const fsPromises = require('fs').promises;
const fs = require('fs');
const readline = require('readline');

const {
  getPublicKey, 
  buildTransaction, 
  jwtSign,
  randomPrivKey
} = require('../helper/helper');


async function signup(email, pk){
  const privateKey = Buffer.from(pk, 'hex');
  const jwtHeader = {headers: {"Authorization":"Bearer " + jwtSign({publicKey: getPublicKey(privateKey)})}};

  let res = await axios.post(`${process.env.SERVER_HOST}/api/auth/challange`);
  const tx_data = {
    type: "auth/signup", 
    email: email, 
    publicKey: getPublicKey(privateKey), 
    challange: res.data.challange, 
    permissions:['client']
  };
  let tx = await buildTransaction(tx_data, privateKey);


  res = await axios.post(`${process.env.SERVER_HOST}/api/auth/signup`, tx, jwtHeader);

}

function generateUser(){
  let privateKey = randomPrivKey();
  
  return {
    email: chance.email(),
    privateKey: privateKey.toString('hex'),
    publicKey: getPublicKey(privateKey)
  };
}

const FILE = './users.txt';

async function generateUserFile(size){
  if(await fileExists(FILE)){
    return;
  }

  let f = await fsPromises.open(FILE, 'w');
  for(let n = 0; n < size; n++){
    await f.write(JSON.stringify(generateUser())+'\n');
  }
  await f.close()
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

async function readUsersFromFile(){
  return new Promise((resolve, reject) =>{
    const rl = readline.createInterface({
      input: fs.createReadStream(FILE),
      crlfDelay: Infinity
    });
  
    let users = [];
  
    rl.on('line', (line) => {
      users.push(JSON.parse(line));
    });
  
    rl.on('close', () => {
      resolve(users);
    });
  });
  
}

module.exports = {signup, generateUserFile, readUsersFromFile}


