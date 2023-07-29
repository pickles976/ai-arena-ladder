FROM node:16-buster-slim

RUN apk add g++ make py3-pip

WORKDIR /usr/app

COPY package.json ./

RUN npm install

COPY campaign.js sanitizeCode.js config.js war.js utils.js supabaseClient.js ./

CMD [ "node", "--es-module-specifier-resolution=node", "campaign.js" ]
