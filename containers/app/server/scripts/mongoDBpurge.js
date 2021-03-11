require('dotenv').config();
const mongo = require('../mongodb/mongo');


(async () => {

  const mongoClient = await mongo.client();
  await mongoClient.db('mydb')
    .collection("block")
    .deleteMany({});

  await mongoClient.db('mydb')
    .collection("transaction")
    .deleteMany({});

  await mongoClient.db('mydb')
    .collection("state")
    .deleteMany({});

  await mongo.close();
})();