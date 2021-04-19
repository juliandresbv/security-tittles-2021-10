#!/bin/bash

helm delete mongodborg1

sleep 1
../../scripts/force-shutdown.sh mongodborg1
