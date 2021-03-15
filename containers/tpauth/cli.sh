#!/bin/bash

CURRENT_UID=$(id -u):$(id -g) docker-compose -f ./docker-compose.yaml \
  run -p 3000:3000 --rm tp1 bash
