#!/bin/bash

cd ./containers/tp1
  npm install
  rm ./.env
  cp ./.env.docker-compose ./.env
cd -

# cd ./containers/client
#   npm install
#   rm ./.env
#   cp ./.env.docker-compose ./.env
# cd -

cd ./containers/app/client
  npm install
  # rm ./.env
  # cp ./.env.docker-compose ./.env
cd -

cd ./containers/app/server
  npm install
  # rm ./.env
  # cp ./.env.docker-compose ./.env
cd -