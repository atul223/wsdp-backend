FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production=false

COPY . .

RUN npx prisma generate

EXPOSE 4000

CMD ["node", "src/server.js"]
