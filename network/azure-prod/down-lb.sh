#!/bin/bash

kubectl config use-context org0

kubectl -f "./org0/sawtooth/loadbalancer.yaml" delete

kubectl -f "./org0/app/loadbalancer.yaml" delete

kubectl config use-context org1

kubectl -f "./org1/sawtooth/loadbalancer.yaml" delete

kubectl -f "./org1/app/loadbalancer.yaml" delete

