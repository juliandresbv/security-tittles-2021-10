#!/bin/bash

cd "./sawtooth"
  ./down.sh
cd - 

cd "./mongodb"
  ./down.sh
cd - 



kubectl -f ./storage-class.yaml delete

# kubectl delete all --all
# kubectl delete pvc --all
