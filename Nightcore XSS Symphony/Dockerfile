FROM node:21-alpine

MAINTAINER Nightcore

WORKDIR /app

COPY package*.json ./

RUN apk update
RUN apk add --no-cache zlib-dev udev nss ca-certificates
RUN apk add --no-cache chromium

RUN npm install

EXPOSE 5000

COPY . .

CMD [ "node", "server.js" ]
