require('dotenv').config();

const { MongoClient } = require("mongodb");

let uri = process.env.MONGO_URI;
if(!uri){
  // uri ="mongodb://root:example@localhost:27017/mydb";
  uri="mongodb://root:example@192.168.99.100:32017/mydb";
}

console.log('uri:', uri);

// Create a new MongoClient
const client = new MongoClient(uri);

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    // Establish and verify connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connected successfully to server");
  
    await client.db('mydb').collection("customers").insertOne({'data': 'data'});
    d = await client.db('mydb').collection("customers").findOne({'data': 'data'});

    console.log(d);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
