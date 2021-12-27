FROM public.ecr.aws/docker/library/node:16-alpine3.14

WORKDIR /usr/src/showpiece

COPY ./package*json ./

RUN npm install

COPY . .

RUN npm run build

USER node

EXPOSE 8080
CMD [ "node", "index.js"]
