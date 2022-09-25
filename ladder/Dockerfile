FROM node:16-buster-slim

WORKDIR /usr/app

COPY package.json ./

RUN npm install

COPY main.js json.js aiControls.js ./

CMD [ "node", "main.js" ]