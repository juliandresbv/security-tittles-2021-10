#!/bin/bash

./setContainerVersion.sh

kubectl config use-context org0

cd "./org0/sawtooth"
  ./build.sh
cd -
cp -r ./org0/sawtooth/build ./build

cd "./org0/sawtooth"
  rm -rf ./build/
  cp -r ../../build/ ./build
cd -
cd "./org1/sawtooth"
  rm -rf ./build/
  cp -r ../../build/ ./build
cd -

kubectl config use-context org0
kubectl -f "./org0/sawtooth/loadbalancer.yaml" apply
kubectl config use-context org1
kubectl -f "./org1/sawtooth/loadbalancer.yaml" apply

./sawtoothIP.sh

declare -A serviceIPS

FILE=$(cat "./build/services-sawtooth-org0.txt")
while read line ; do
  name=$(echo "$line"     | sed 's/^sawtooth-\(\S\+\)-lb\s*\(\S*\)/\1/g')
  sip=$(echo "$line"      | sed 's/^sawtooth-\(\S\+\)-lb\s*\(\S*\)/\2/g')
  serviceIPS["$name"]="$sip"
done <<< "$FILE"
FILE=$(cat "./build/services-sawtooth-org1.txt")
while read line ; do
  name=$(echo "$line"     | sed 's/^sawtooth-\(\S\+\)-lb\s*\(\S*\)/\1/g')
  sip=$(echo "$line"      | sed 's/^sawtooth-\(\S\+\)-lb\s*\(\S*\)/\2/g')
  serviceIPS["$name"]="$sip"
done <<< "$FILE"

FILE="./org0/sawtooth/externalPeers.yaml"
RES=$(cat "$FILE.backup")

for e in "${!serviceIPS[@]}"; do
  s="${serviceIPS["$e"]}"
  RES=$(echo "$RES" | sed "s/ip-peer${e}/${s}/g")
done

echo "$RES" > "$FILE"
FILE="./org1/sawtooth/externalPeers.yaml"
RES=$(cat "$FILE.backup")

for e in "${!serviceIPS[@]}"; do
  s="${serviceIPS["$e"]}"
  RES=$(echo "$RES" | sed "s/ip-peer${e}/${s}/g")
done

echo "$RES" > "$FILE"

kubectl config use-context org0

cd ./org0
  kubectl -f ./sawtooth/externalPeers.yaml apply
  ./up.sh
cd -

cd ./org0/app/loadbalancer
  ./up.sh
cd -
cd ./org0/app
  ./up.sh
cd -
kubectl config use-context org1

cd ./org1
  kubectl -f ./sawtooth/externalPeers.yaml apply
  ./up.sh
cd -

cd ./org1/app/loadbalancer
  ./up.sh
cd -
cd ./org1/app
  ./up.sh
cd -


kubectl config use-context org0
./scripts/wait-for-pods.sh pbft-org0peer0 pbft-org0peer1 
kubectl config use-context org1
./scripts/wait-for-pods.sh pbft-org1peer0 pbft-org1peer1 
