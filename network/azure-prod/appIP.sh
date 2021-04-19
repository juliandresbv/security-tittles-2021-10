#!/bin/bash

mkdir -p ./build


rm -f ./build/services-app-org0.txt
rm -f ./services.txt

kubectl config use-context org0
../scripts/servicesIP.sh apporg0app0-lb apporg0app1-lb 

mv ./services.txt ./build/services-app-org0.txt


rm -f ./build/services-app-org1.txt
rm -f ./services.txt

kubectl config use-context org1
../scripts/servicesIP.sh apporg1app0-lb apporg1app1-lb 

mv ./services.txt ./build/services-app-org1.txt


