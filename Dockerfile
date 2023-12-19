FROM node:18-alpine

WORKDIR /src

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 3001

CMD ["node", "src/server.js"]