#!/bin/bash

ORG="$1"
if [[ -z "$1" ]]; then
  "./test.sh org_number"
  exit 0
fi

kubectl run --rm -it borrar1 --image le999/org0app0:1.0 \
  --restart=Never \
  --env "SAWTOOTH_PRIVATE_KEY=0x7f664d71e4200b4a2989558d1f6006d0dac9771a36a546b1a47c384ec9c4f04b" \
  --env "SAWTOOTH_REST=http://sawtooth-org${ORG}:8008" \
  --env "VALIDATOR_HOST=tcp://sawtooth-org${ORG}peer0:4004" \
  --env "MONGO_URI=mongodb://root:example@mongodborg${ORG}:27017/mydb" \
  --env "KAFKA_CONSUMER=kafka-org${ORG}.default.svc.cluster.local:9092" \
  --env "KAFKA_PRODUCER=kafka-org${ORG}-0.kafka-org${ORG}-headless.default.svc.cluster.local:9092" \
  --env "RETHINK_HOST=rethinkdborg${ORG}-rethinkdb-proxy" \
  --env "RETHINK_PORT=28015" \
  --env "RETHINK_PASSWORD=rethinkdb" \
  --env "RETHINK_USER=admin" \
  -- bash -c "node ./scripts/sawtooth.js tp0; node ./scripts/sawtooth.js tp1; node ./scripts/mongo-sample.js; bash"
