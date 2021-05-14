# https://nodejs.org/fr/docs/guides/nodejs-docker-webapp/


FROM node:10 as build

WORKDIR /usr/src/app
COPY ./package*.json ./

RUN npm install --loglevel verbose

COPY . .


EXPOSE 3001

CMD [ "node", "bin/www" ]
