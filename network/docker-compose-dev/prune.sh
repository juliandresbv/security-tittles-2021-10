#!/bin/bash

docker rm $(docker ps -a -q)
docker volume prune -f