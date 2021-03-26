#!/bin/bash

cd ./bundletest
npm run bundle
cd -
# CURRENT_UID=$(id -u):$(id -g) docker-compose -f ./docker-compose/k6.yaml run cli \
#   run --vus 20 --duration 2s ./bundletest/dist/myunderscore.bundle.js

#With grafana
CURRENT_UID=$(id -u):$(id -g) docker-compose -f ./docker-compose/k6.yaml run cli \
  run --vus 20 --duration 2s --out influxdb=http://172.17.0.1:8086/k6 \
  ./bundletest/dist/myunderscore.bundle.js
