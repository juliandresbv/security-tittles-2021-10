#!/bin/bash

echo "WARNING: build only for minkube"

eval $(minikube -p minikube docker-env)

cd ./server
  docker build -t le999/app1:1.0 .
cd -
