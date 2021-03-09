const { MongoClient } = require("mongodb");

let uri = process.env.MONGO_URI;

console.log('uri:', uri);

// Create a new MongoClient

let clientPromise = (async () => {
  const client = new MongoClient(uri);
  await client.connect();

  // Establish and verify connection
  await client.db("admin").command({ ping: 1 });
  return client;
})();

module.exports.client = () => {
  if(!closed){
    return clientPromise;
  }
  return Promise.reject(new Error('MongoDB closed'));
}

let closed = false;
module.exports.close = async function(){
  closed = true;
  const client = await clientPromise;
  await client.close();
  console.log('Close MongoDB');
}
