FROM node:lts-alpine AS base
FROM base AS deploy

WORKDIR /usr/src/showpiece

COPY ./package*json ./

RUN npm install

COPY . .

RUN npm run build

USER node

EXPOSE 8080
CMD [ "npm", "run", "start"]
