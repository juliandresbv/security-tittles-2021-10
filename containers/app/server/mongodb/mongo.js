const { MongoClient } = require("mongodb");

let uri = process.env.MONGO_URI;

console.log('uri:', uri);

// Create a new MongoClient

async function connect() {
  const client = new MongoClient(uri);
  await client.connect();

  // Establish and verify connection
  await client.db("admin").command({ ping: 1 });
  return client;
}

let clientPromise = connect();


//Create indexes:
(async () =>  {
  const client = await clientPromise;
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
  

})();

let closed = false;

module.exports.client = () => {
  if(!closed){
    return clientPromise;
  }
  return Promise.reject(new Error('MongoDB closed'));
}

module.exports.close = async function(){
  closed = true;
  const client = await clientPromise;
  await client.close();
  console.log('Close MongoDB');
}

module.exports.connect = async function(){
  closed = false;
  clientPromise = connect();
}