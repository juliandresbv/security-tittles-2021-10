#!/bin/bash

mkdir -p ./build


rm -f ./build/services-sawtooth-org0.txt
rm -f ./services.txt

kubectl config use-context org0
../scripts/servicesIP.sh sawtooth-org0peer0-lb sawtooth-org0peer1-lb 
mv ./services.txt ./build/services-sawtooth-org0.txt

rm -f ./build/services-sawtooth-org1.txt
rm -f ./services.txt

kubectl config use-context org1
../scripts/servicesIP.sh sawtooth-org1peer0-lb sawtooth-org1peer1-lb 
mv ./services.txt ./build/services-sawtooth-org1.txt

