#!/bin/bash

#Without grafana
# CURRENT_UID=$(id -u):$(id -g) docker-compose -f ./docker-compose/k6.yaml run cli \
#   run --vus 20 --duration 2s --out json=out.json script.js

# CURRENT_UID=$(id -u):$(id -g) docker-compose -f ./docker-compose/k6.yaml run cli \
#   run --vus 20 --iterations 200 script.js

#With grafana
CURRENT_UID=$(id -u):$(id -g) docker-compose -f ./docker-compose/k6.yaml run cli \
  run --vus 100 --duration 10s --out influxdb=http://influxdb:8086/k6 script.js
