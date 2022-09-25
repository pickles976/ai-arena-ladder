FROM node:16-buster-slim

WORKDIR /usr/app

COPY package.json ./

RUN npm install

COPY game.js sanitizeCode.js ./

CMD [ "node", "game.js" ]