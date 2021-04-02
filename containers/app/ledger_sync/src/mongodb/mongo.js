const { MongoClient } = require("mongodb");

let client;

module.exports.init = async function(){
  if(client){
    throw new Error('Trying to initialize twice!!');
  }
  console.log('mongo uri:', process.env.MONGO_URI);
  client = new MongoClient(process.env.MONGO_URI, { useUnifiedTopology: true });
  await client.connect();

  // Establish and verify connection
  await client.db("admin").command({ ping: 1 });
};

module.exports.client = () => {
  return client;
};

module.exports.close = async function(){
  if(client){
    await client.close();
    client = null;
    console.log('Close MongoDB');
  }
  else{
    console.log('Trying to close closed connection')
  }
};


module.exports.createIndexes = async function(){
  const db = client.db('mydb');
  try{
    await db.collection('block').createIndex({block_num: 1});
    await db.collection('todo_transaction').createIndex({block_num: 1});
    await db.collection('todo_transaction').createIndex({head_id: 1, idx: -1});

    await db.collection('todo_state_history').createIndex({key: 1, block_num: 1}, {unique: true});
    await db.collection('todo_state_history').createIndex({address: 1, key: 1, block_num: 1});

    await db.collection('todo_state').createIndex({"value.owner": 1});

  }
  catch(err){
    console.log(err);
  }
}

