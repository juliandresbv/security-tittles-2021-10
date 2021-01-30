#!/bin/bash

kubectl delete -f ./sawtooth.yaml
# kubectl delete -f ./ingress.yaml

../../scripts/wait-for-pods-down.sh pbft-org0peer0

