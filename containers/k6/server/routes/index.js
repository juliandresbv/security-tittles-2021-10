var express = require('express');
var router = express.Router();
const axios = require('axios');
const Chance = require('chance');
const chance = new Chance();

const {getPublicKey, buildTransaction, jwtSign, randomPrivKey} = require('../scripts/src/helper/helper');

router.post('/api/auth/signup', async function(req, res) {

  const privateKey = randomPrivKey();
  const jwtHeader = {headers: {"Authorization":"Bearer " + jwtSign({publicKey: getPublicKey(privateKey)})}};

  try{
    let ares = await axios.post(`${process.env.SERVER_HOST}/auth/challange`);
    const tx_data = {
      type: "auth/signup", 
      email: chance.email(), 
      publicKey: getPublicKey(privateKey), 
      challange: ares.data.challange, 
      permissions:['client']
    };
    let tx = await buildTransaction(tx_data, privateKey);
  
  
    ares = await axios.post(`${process.env.SERVER_HOST}/auth/signup`, tx, jwtHeader);
  
    return res.json({
      email: tx_data.email,
      publicKey: tx_data.publicKey,
      privateKey: privateKey.toString('hex')
    });
  }
  catch(err){
    res.status(400).json(err);
  }
  
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({from:'GET'});
});


module.exports = router;
