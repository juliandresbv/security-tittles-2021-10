# https://nodejs.org/fr/docs/guides/nodejs-docker-webapp/


FROM node:10 as build

WORKDIR /app
COPY ./package*.json ./

RUN npm install --loglevel verbose

COPY . .

CMD [ "node", "bin/www" ]
