#!/bin/bash

#Script that calls sawtooth

KEY=$1
node sawooth/post.js 'intkey' $KEY "{\"func\": \"put\", \"params\": {\"id\": \"$KEY\", \"value\": \"hi\"}}"