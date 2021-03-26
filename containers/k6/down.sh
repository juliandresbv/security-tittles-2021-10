#!/bin/bash

CURRENT_UID=$(id -u):$(id -g) docker-compose -f ./docker-compose/db.yaml down

CURRENT_UID=$(id -u):$(id -g) docker-compose -f ./docker-compose/k6.yaml down

# docker volume prune
