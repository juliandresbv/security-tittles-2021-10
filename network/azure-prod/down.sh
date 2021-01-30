#!/bin/bash

kubectl config use-context org0

cd ./org0
  kubectl -f ./sawtooth/externalPeers.yaml delete
  ./down.sh
cd -

cd ./org0/app
  ./down.sh
cd -
kubectl config use-context org1

cd ./org1
  kubectl -f ./sawtooth/externalPeers.yaml delete
  ./down.sh
cd -

cd ./org1/app
  ./down.sh
cd -

kubectl config use-context org0
./scripts/wait-for-pods-down.sh pbft-org0peer0 pbft-org0peer1 
kubectl config use-context org1
./scripts/wait-for-pods-down.sh pbft-org1peer0 pbft-org1peer1 
