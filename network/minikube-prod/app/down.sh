#!/bin/bash

kubectl -f ./network.yaml delete
kubectl -f ./loadbalancer.yaml delete
