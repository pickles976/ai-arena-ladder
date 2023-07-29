FROM node:16-buster-slim

RUN apt-get update && apt-get install python3

WORKDIR /usr/app

COPY package.json ./

RUN npm install

COPY campaign.js sanitizeCode.js config.js war.js utils.js supabaseClient.js ./

CMD [ "node", "--es-module-specifier-resolution=node", "campaign.js" ]
