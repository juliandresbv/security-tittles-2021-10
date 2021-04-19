#!/bin/bash

helm delete mongodborg0

kubectl delete -f ./network.yaml

sleep 1
../../scripts/force-shutdown.sh mongodborg0 mongoexpress-0