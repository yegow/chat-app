FROM node:12 AS production
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN export NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]
