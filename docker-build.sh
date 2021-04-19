#!/bin/bash

echo "WARNING: build only for minkube"

eval $(minikube -p minikube docker-env)

cd ./containers/tp1
  docker build -t le999/tp1_todo:1.0 .
cd -

cd ./containers/tpauth
  docker build -t le999/tpauth_todo:1.0 .
cd -

cd ./containers/app
  docker build -t le999/app_todo:1.0 .
cd -

cd ./containers/app_ledger_sync
  docker build -t le999/app_ledger_sync_todo:1.0 .
cd -