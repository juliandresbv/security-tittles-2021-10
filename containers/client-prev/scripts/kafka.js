require('dotenv').config()

const Kafka = require('node-rdkafka');
const _ = require('underscore');

console.log('KAFKA_CONSUMER:', process.env.KAFKA_CONSUMER);
console.log('KAFKA_PRODUCER:', process.env.KAFKA_PRODUCER);

if(!process.env.KAFKA_CONSUMER){
  console.log('No KAFKA_CONSUMER');
  process.exit(1);
}

if(!process.env.KAFKA_PRODUCER){
  console.log('No KAFKA_PRODUCER');
  process.exit(1);
}

let consumer;
let client;

let consumerCreated = new Promise((resolve, reject)=>{
  client = Kafka.AdminClient.create({
    'client.id': 'kafka-admin',
    'metadata.broker.list': process.env.KAFKA_PRODUCER
  });

  consumer = new Kafka.KafkaConsumer({
    'group.id': 'kafka',
    'metadata.broker.list': process.env.KAFKA_PRODUCER,
  }, {});
  
  consumer.connect();
  consumer
    .on('ready', function() {
      consumer.getMetadata({
        topic: 'mytopic',
        timeout: 10000
      }, function(err, metadata) {
        if (err) {
          console.error('Error getting metadata');
          reject(err);
        } else {
          // console.log('Got metadata');
          // console.log(metadata);
          let mytopicExists = _.some(metadata.topics, (t) => {return t.name == 'mytopic'});
          if(!mytopicExists){
            console.log('Creating topic')
            client.createTopic({
               topic: 'mytopic',
               num_partitions: 1,
               replication_factor: 1
             }, function(err) {
               if(err){
                 return reject(err);
               }
               resolve();
             }); 
          } else {
            resolve();
          }
        }
      });
    })
})
.then(()=>{
  consumer.disconnect();
  client.disconnect();
})
.then(()=>{
  console.log('CREATED');

  // Read from the librdtesting-01 topic... note that this creates a new stream on each call!
  var streamConsumer = new Kafka.KafkaConsumer.createReadStream({
    'group.id': 'kafka',
    'metadata.broker.list': process.env.KAFKA_CONSUMER,
    }, {}, {
    topics: ['mytopic']
  });

  streamConsumer.on('data', function(message) {
    console.log('Got message:');
    console.log(message.value.toString());
    streamConsumer.destroy();
  });
})
.then(()=>{
  return new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
})
.then(()=>{
  // Our producer with its Kafka brokers
  // This call returns a new writable stream to our topic 'topic-name'
  var streamProducer = Kafka.Producer.createWriteStream({
    'group.id': 'kafka',
    'metadata.broker.list': process.env.KAFKA_PRODUCER
  }, {}, {
    topic: 'mytopic'
  });

  // Writes a message to the stream
  var queuedSuccess = streamProducer.write(Buffer.from('Awesome message'));

  if (queuedSuccess) {
    console.log('We queued our message!');
  } else {
    // Note that this only tells us if the stream's queue is full,
    // it does NOT tell us if the message got to Kafka!  See below...
    console.log('Too many messages in our queue already');
  }

  // NOTE: MAKE SURE TO LISTEN TO THIS IF YOU WANT THE STREAM TO BE DURABLE
  // Otherwise, any error will bubble up as an uncaught exception.
  streamProducer.on('error', function (err) {
    // Here's where we'll know if something went wrong sending to Kafka
    console.error('Error in our kafka stream');
    console.error(err);
  })
  streamProducer.end();
});


