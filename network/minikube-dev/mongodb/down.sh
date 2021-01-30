#!/bin/bash

helm delete mongodborg0

kubectl delete -f ./network.yaml
