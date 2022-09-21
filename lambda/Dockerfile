FROM public.ecr.aws/lambda/nodejs:16.2022.09.21.11-x86_64

COPY package.json ${LAMBDA_TASK_ROOT}

RUN npm install

COPY index.js sanitizeCode.js ${LAMBDA_TASK_ROOT}

CMD [ "index.handler" ]