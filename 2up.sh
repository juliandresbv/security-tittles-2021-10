#!/bin/bash

on_exit(){
  echo "on_exit"
  jobs -p
  kill $(jobs -p)
}

trap "on_exit" SIGINT SIGTERM


gnome-terminal --tab -- bash -c "cd ./network/docker-compose-dev; ./down.sh; ./up.sh; bash"

sleep 10


cd ./containers/tp1
  npm start &
cd -

cd ./containers/app/server
  npm start &
cd -


cd ./containers/app/client
  npm start &
cd -

rm ./containers/app/server/data/blocks.json
rm ./containers/app/server/data/state.json

cd ./containers/app/ledger_sync
  npm start &
cd -


wait
