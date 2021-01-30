#!/bin/bash

TP_V="tp1:latest"
APP_V="app1:latest"

FILE="./azure-prod/org0/sawtooth/network.yaml"
cat "${FILE}.backup" | sed "s/le999\/tp1:1.0/le999\/${TP_V}/g" > "$FILE"

FILE="./azure-prod/org0/app/network.yaml"
cat "${FILE}.backup" | sed "s/le999\/app1:1.0/le999\/${APP_V}/g" > "$FILE"

FILE="./azure-prod/org0/app/run1.sh"
cat "${FILE}.backup" | sed "s/le999\/app1:1.0/le999\/${APP_V}/g" > "$FILE"
chmod 755 "$FILE"

FILE="./azure-prod/org1/sawtooth/network.yaml"
cat "${FILE}.backup" | sed "s/le999\/tp1:1.0/le999\/${TP_V}/g" > "$FILE"

FILE="./azure-prod/org1/app/network.yaml"
cat "${FILE}.backup" | sed "s/le999\/app1:1.0/le999\/${APP_V}/g" > "$FILE"

FILE="./azure-prod/org1/app/run1.sh"
cat "${FILE}.backup" | sed "s/le999\/app1:1.0/le999\/${APP_V}/g" > "$FILE"
chmod 755 "$FILE"



FILE="./azure/sawtooth/network.yaml"
cat "${FILE}.backup" | sed "s/le999\/tp1:1.0/le999\/${TP_V}/g" > "$FILE"

FILE="./azure/app/network.yaml"
cat "${FILE}.backup" | sed "s/le999\/app1:1.0/le999\/${APP_V}/g" > "$FILE"

FILE="./azure/app/run1.sh"
cat "${FILE}.backup" | sed "s/le999\/app1:1.0/le999\/${APP_V}/g" > "$FILE"
chmod 755 "$FILE"