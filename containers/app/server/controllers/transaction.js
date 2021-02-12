var _ = require('underscore');
const protobuf = require('sawtooth-sdk/protobuf');
const axios = require('axios');

module.exports.authTransactionMiddleware = async function(req, res, next){
  let batchListBytes = Buffer.from(req.body.batch, 'base64');
  const batcheList = protobuf.BatchList.decode(batchListBytes);
  const batch = batcheList.batches[0];

  let batchHeader = protobuf.BatchHeader.decode(batch.header);
  let batchSigner = batchHeader.signerPublicKey;

  let transactions = _.map(batch.transactions, (n) =>{
    return {
      signerPublicKey: protobuf.TransactionHeader.decode(n.header).signerPublicKey,
      payload: JSON.parse(Buffer.from(n.payload).toString('utf8'))
    }
  });
  const transactionSigners = _.map(transactions, t => t.signerPublicKey);
  console.log(batchSigner);
  //Should make some check
  let allOk = true;

  if(!allOk){
    return res.status(401).json({msg: 'publickey does not have required permissions'});
  }
  next();
}

module.exports.postTransaction = async function(req, res) {

  let batchListBytes = Buffer.from(req.body.batch, 'base64');

  let params = {
    headers: {'Content-Type': 'application/octet-stream'}
  };
  
  try{
    let r = await axios.post(`${process.env.SAWTOOTH_REST}/batches`, batchListBytes, params)
    return res.json({msg: "Ok"});
  }
  catch(err){
    console.log(err.data);
    return res.status(500).json({err});
  }
};
