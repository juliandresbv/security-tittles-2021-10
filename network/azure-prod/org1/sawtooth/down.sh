#!/bin/bash

kubectl delete -f ./network.yaml
# kubectl delete -f ./loadbalancer.yaml
kubectl delete -f ./sawtooth-create-keys.yaml
kubectl delete -f ./build/pbft-keys-configmap.yaml

kubectl delete configmap genesis-batch
kubectl delete configmap validator-toml 

#../../scripts/wait-for-pods-down.sh pbft-org1peer0 pbft-org1peer1 
