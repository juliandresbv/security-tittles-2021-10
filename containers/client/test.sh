#!/bin/bash

# HOST="192.168.99.100:30011"
HOST="localhost:3010"


if [[ ! -z "$1" ]]; then
  curl -X POST --header "Content-Type:application/json" ${HOST}/data \
    -d "{\"key\":\"key1x${1}\", \"value\": \"value${1}\"}" &
  curl -X POST --header "Content-Type:application/json" ${HOST}/data \
    -d "{\"key\":\"key2x${1}\", \"value\": \"value${1}\"}" &
  
  wait
  echo ""


else
  curl -X POST --header "Content-Type:application/json" ${HOST}/data \
    -d '{"key":"key4", "value": "value0"}'
  echo ""
fi
