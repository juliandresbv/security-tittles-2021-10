#!/bin/bash

kubectl -f ./storage-class.yaml apply

cd "./sawtooth"
  ./up.sh
cd - 

cd "./mongodb"
  ./up.sh
cd - 


