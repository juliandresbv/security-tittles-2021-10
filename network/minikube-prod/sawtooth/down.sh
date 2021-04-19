#!/bin/bash

kubectl delete -f ./network.yaml --grace-period=0 --force
kubectl delete -f ./loadbalancer.yaml
kubectl delete -f ./sawtooth-create-keys.yaml
kubectl delete -f ./build/pbft-keys-configmap.yaml

kubectl delete configmap genesis-batch
kubectl delete configmap validator-toml 

sleep 1
../../scripts/force-shutdown.sh pbft-org0peer0 pbft-org0peer1 pbft-org1peer0 pbft-org1peer1 
../../scripts/wait-for-pods-down.sh pbft-org0peer0 pbft-org0peer1 pbft-org1peer0 pbft-org1peer1 
