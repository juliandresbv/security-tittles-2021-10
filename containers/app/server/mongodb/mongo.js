const { MongoClient } = require("mongodb");

let uri = process.env.MONGO_URI;

console.log('uri:', uri);

// Create a new MongoClient

const clientPromise = (async () => {
  const client = new MongoClient(uri);
  await client.connect();

  // Establish and verify connection
  await client.db("admin").command({ ping: 1 });
  return client;
})();

module.exports.client = clientPromise;

module.exports.close = async function(){
  const client = await clientPromise;
  await client.close();
  console.log('Diconnected MongoDB');
}



// async function run() {
//   try {
//     // Connect the client to the server
//     await client.connect();

//     // Establish and verify connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Connected successfully to server");
  
//     await client.db('mydb').collection("customers").insertOne({'data': 'data'});
//     d = await client.db('mydb').collection("customers").findOne({'data': 'data'});

//     console.log(d);
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);
