#!/bin/bash

helm install mongodborg0 bitnami/mongodb --version 9.2.4 -f ./config.yaml

# helm show values bitnami/mongodb
