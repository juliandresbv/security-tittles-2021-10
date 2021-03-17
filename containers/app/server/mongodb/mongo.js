const { MongoClient } = require("mongodb");

let uri = process.env.MONGO_URI;

console.log('uri:', uri);

let clientPromise = null;
let closed = true;

module.exports.client = () => {
  if(!clientPromise){
    clientPromise = makeClientPromise();
  }
  return clientPromise;
};

module.exports.close = async function(){
  if(clientPromise){
    const client = await clientPromise;
    await client.close();
    clientPromise = null;
    console.log('Close MongoDB');
  }
  else{
    console.log('Trying to close closed connection')
  }
};


// Create a new MongoClient
async function makeClientPromise() {
  const client = new MongoClient(uri);
  await client.connect();

  // Establish and verify connection
  await client.db("admin").command({ ping: 1 });
  return client;
}



module.exports.createIndexes = async function(){
  const client = await module.exports.client();
  const db = client.db('mydb');

  try{
    await db.collection('block').createIndex({block_num: 1});
    await db.collection('todo_transaction').createIndex({block_num: 1});
    await db.collection('todo_transaction').createIndex({head_id: 1, idx: -1});

    await db.collection('todo_state_history').createIndex({key: 1, block_num: 1}, {unique: true});
    await db.collection('todo_state_history').createIndex({address: 1, key: 1, block_num: 1});

  }
  catch(err){
    console.log(err);
  }
}

