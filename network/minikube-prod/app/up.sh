#!/bin/bash

kubectl -f ./network.yaml apply
cd ./loadbalancer
./up.sh
cd -
