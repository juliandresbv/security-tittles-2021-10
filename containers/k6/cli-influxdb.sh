#!/bin/bash

CURRENT_UID=$(id -u):$(id -g) docker-compose -f ./docker-compose/db.yaml exec influxdb influx

#https://docs.influxdata.com/influxdb/v1.8/tools/shell/

# SHOW DATABASES
# use k6
# SHOW SERIES
# SELECT * FROM data_sent