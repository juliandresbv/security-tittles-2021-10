#!/bin/bash

kubectl -f ./org0app0.yaml delete
kubectl -f ./org0app1.yaml delete
kubectl -f ./org1app0.yaml delete
kubectl -f ./org1app1.yaml delete
