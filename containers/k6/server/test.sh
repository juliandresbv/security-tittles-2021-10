#!/bin/bash

curl -X GET --header "Content-Type:application/json" localhost:3001/
echo ""

curl -X POST --header "Content-Type:application/json" localhost:3001/data \
  -d '{"hi":"there"}'
echo ""

curl -X GET --header "Content-Type:application/json" localhost:3001/data/123
echo ""
