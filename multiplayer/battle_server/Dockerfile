FROM node:16-buster-slim

WORKDIR /usr/app

COPY package.json ./

RUN npm install

COPY battle.js game.js ./

CMD [ "node", "--es-module-specifier-resolution=node", "battle.js" ]