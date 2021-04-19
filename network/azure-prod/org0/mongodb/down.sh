#!/bin/bash

helm delete mongodborg0

sleep 1
../../scripts/force-shutdown.sh mongodborg0
