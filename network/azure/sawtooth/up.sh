#!/bin/bash

#https://sawtooth.hyperledger.org/docs/core/releases/latest/app_developers_guide/kubernetes_test_network.html

echo "if does not work delete ./build"
if [[ ! -d "./build" ]]; then
  ./build.sh    
fi

kubectl apply -f ./build/pbft-keys-configmap.yaml
kubectl create configmap genesis-batch --from-file=./build/genesis.batch 
kubectl create configmap validator-toml --from-file=./build/validator.toml 

sleep 10

kubectl apply -f ./loadbalancer.yaml
kubectl apply -f ./network.yaml

../../scripts/wait-for-pods.sh pbft-org0peer0 pbft-org0peer1 pbft-org1peer0 pbft-org1peer1 
