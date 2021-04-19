#!/bin/bash

kubectl delete -f ./sawtooth.yaml
# kubectl delete -f ./ingress.yaml

sleep 1
../../scripts/force-shutdown.sh pbft-org0peer0
../../scripts/wait-for-pods-down.sh pbft-org0peer0

