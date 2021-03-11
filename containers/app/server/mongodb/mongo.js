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


//Create indexes:
(async () =>  {
  const client = await clientPromise;
  const db = client.db('mydb');

  try{
    await db.collection('block').createIndex({block_num: 1});
    await db.collection('transaction').createIndex({block_num: 1});
    await db.collection('transaction').createIndex({head_id: 1, idx: -1});

    await db.collection('state').createIndex({address: 1, key: 1, block_num: 1}, {unique: true});

  }
  catch(err){
    console.log(err);
  }
  

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
