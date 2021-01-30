#!/bin/bash

rm -rf "./build"
mkdir -p "./build"
# kubectl delete -f ./pbft-keys-configmap.yaml
kubectl apply -f ./sawtooth-create-keys.yaml
../../scripts/wait-for-pods.sh "pbft-keys"

KEY_CONTAINER=$(kubectl get pods | awk '/pbft-keys/ {print $1}')

mkdir -p "./build"
rm "./build/finished.txt" > /dev/null 2>&1
kubectl cp pbft-keys:/finished.txt ./build/finished.txt
while [[ ! -e "./build/finished.txt" ]]; do
  kubectl cp pbft-keys:/finished.txt ./build/finished.txt
  sleep 1
done

kubectl cp pbft-keys:/var/lib/sawtooth/keys.txt ./build/keys.txt
FILE="./build/pbft-keys-configmap.yaml"

cat "./pbft-keys-configmap.template.yaml" > $FILE
echo "# auto-generated" >> $FILE
cat "./build/keys.txt" | awk '{print "  " $0}' >> $FILE

kubectl cp pbft-keys:/var/lib/sawtooth/config.batch ./build/config.batch
kubectl cp pbft-keys:/var/lib/sawtooth/config-genesis.batch ./build/config-genesis.batch
kubectl cp pbft-keys:/var/lib/sawtooth/data/genesis.batch ./build/genesis.batch
kubectl cp pbft-keys:/var/lib/sawtooth/network_keys.txt ./build/network_keys.txt

kubectl delete -f ./sawtooth-create-keys.yaml --grace-period=0 --force

NETWORK_PUB_KEY=$(cat ./build/network_keys.txt | grep "network_public_key" | sed 's/^\(\S\+\)\s=\s\(\S\+\)\s*/\2/g')
NETWORK_PRIV_KEY=$(cat ./build/network_keys.txt | grep "network_private_key" | sed 's/^\(\S\+\)\s=\s\(\S\+\)\s*/\2/g')

#https://unix.stackexchange.com/questions/129059/how-to-ensure-that-string-interpolated-into-sed-substitution-escapes-all-metac
escaped_pub=$(printf '%s\n' "$NETWORK_PUB_KEY" | sed 's:[\\/&]:\\&:g;$!s/$/\\/')
escaped_priv=$(printf '%s\n' "$NETWORK_PRIV_KEY" | sed 's:[\\/&]:\\&:g;$!s/$/\\/')

cat "./conf/validator.template.toml" | \
  sed "s/'net_pub_key'/'${escaped_pub}'/g" | \
  sed "s/'net_priv_key'/'${escaped_priv}'/g" > "./build/validator.toml"