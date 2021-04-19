#!/bin/bash

kubectl config use-context org0

kubectl -f "./org0/sawtooth/loadbalancer.yaml" delete

cd ./org0/app/loadbalancer
  ./down.sh
cd -
kubectl config use-context org1

kubectl -f "./org1/sawtooth/loadbalancer.yaml" delete

cd ./org1/app/loadbalancer
  ./down.sh
cd -
