#!/bin/bash

kubectl -f ./network.yaml delete
cd ./loadbalancer
./down.sh
cd -

../../scripts/force-shutdown.sh  app-org0app0  app-org0app1  app-org1app0  app-org1app1 
