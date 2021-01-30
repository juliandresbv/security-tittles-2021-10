# https://nodejs.org/fr/docs/guides/nodejs-docker-webapp/

FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --verbose

COPY . .

EXPOSE 3000

# CMD [ "bash", "-c" , "./test.sh && sleep 120"]

CMD [ "bash", "-c" , "node ./bin/www"]
