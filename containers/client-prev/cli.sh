#!/bin/bash

docker-compose -f ./docker-compose.yaml build
CURRENT_UID=$(id -u):$(id -g) docker-compose -f ./docker-compose.yaml \
  run -p 3000:3000 --rm client1 bash
