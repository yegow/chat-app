FROM node:12 AS builder
WORKDIR /app

COPY package*.json ./

RUN npm install
<<<<<<< HEAD

COPY . /app
=======
# If you are building your code for production
# RUN npm ci --only=production
COPY . .
>>>>>>> 7669f580263245b251021efc999aa343b77cc1ae
RUN cd client && rm yarn.lock && npm install && npm run build && cd ..


FROM node:12 AS production
RUN npm install -g serve
WORKDIR /app
RUN ls -a
COPY --from=builder ./app/client/build ./client/build

EXPOSE 5000 3000

CMD ["npm", "run", "prod"]
