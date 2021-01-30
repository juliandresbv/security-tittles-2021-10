#!/bin/bash

gnome-terminal --tab -- bash -c "cd ./network/docker-compose-dev; ./down.sh; ./up.sh; bash"

sleep 10
gnome-terminal --tab -- bash -c "cd ./containers/tp1; node ./index.js; bash"
# gnome-terminal --tab -- bash -c "cd ./containers/client; npm start; bash"

gnome-terminal --tab -- bash -c "cd ./containers/app/server; npm start; bash"
gnome-terminal --tab -- bash -c "cd ./containers/app/client; npm start; bash"
