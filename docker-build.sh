#!/bin/bash

echo "WARNING: build only for minkube"

eval $(minikube -p minikube docker-env)

cd ./containers/tp1
  docker build -t le999/tp1:1.0 .
cd -

cd ./containers/client
  docker build -t le999/app1:1.0 .
cd -
