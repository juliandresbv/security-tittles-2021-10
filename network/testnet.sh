#!/bin/bash

peers=(org0peer0 org0peer1 org1peer0 org1peer1 )

for n in "${peers[@]}"; do

  echo "------------------"
  echo "POD: ${n}"
  POD=$(kubectl get pods | awk "/pbft-${n}-/ {print $1}")
  kubectl exec $POD --container sawtooth-shell -- bash -c "sawtooth peer list && sawtooth block list"
done
