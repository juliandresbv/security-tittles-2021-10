#!/bin/bash

#https://sawtooth.hyperledger.org/docs/core/releases/latest/app_developers_guide/kubernetes_test_network.html

kubectl apply -f ./sawtooth.yaml
# kubectl apply -f ./ingress.yaml

../../scripts/wait-for-pods.sh pbft-org0peer0
