FROM node:alpine

RUN mkdir -p /opt/app

WORKDIR /opt/app

COPY package.json .
COPY package-lock.json .
RUN npm install --quiet

COPY . .

EXPOSE 3000

CMD node index.js
