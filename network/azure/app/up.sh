#!/bin/bash

kubectl -f ./network.yaml apply
kubectl -f ./loadbalancer.yaml apply
