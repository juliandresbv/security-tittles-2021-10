#!/bin/bash

SERVER_HOST="192.168.99.100:30001"

curl -X GET --header "Content-Type:application/json" "${SERVER_HOST}"/
echo ""

curl -X POST --header "Content-Type:application/json" "${SERVER_HOST}/data" \
  -d '{"hi":"there"}'
echo ""

curl -X GET --header "Content-Type:application/json" "${SERVER_HOST}/data/123"
echo ""
