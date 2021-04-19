#!/bin/bash

kubectl run --rm -it borrar1 --image le999/app_todo:1.0 \
  --env "SAWTOOTH_REST=http://sawtooth-org0:8008" \
  --env "VALIDATOR_HOST=tcp://sawtooth-org0peer0:4004" \
  --env "MONGO_URI=mongodb://root:example@mongodborg0:27017/mydb" \
  --env "KAFKA_CONSUMER=kafka-org0.default.svc.cluster.local:9092" \
  --env "KAFKA_PRODUCER=kafka-org0-0.kafka-org0-headless.default.svc.cluster.local:9092" \
  --env "RETHINK_HOST=rethinkdborg0-rethinkdb-proxy" \
  --env "RETHINK_PORT=28015" \
  --env "RETHINK_PASSWORD=rethinkdb" \
  --env "RETHINK_USER=admin" \
  --image-pull-policy=Never --restart=Never -- bash