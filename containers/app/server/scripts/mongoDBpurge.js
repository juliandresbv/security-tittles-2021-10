require('dotenv').config();
const mongo = require('../mongodb/mongo');


(async () => {

  const mongoClient = await mongo.client();
  await mongoClient.db('mydb')
    .collection("blocks")
    .remove({});
})();