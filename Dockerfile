FROM node:12 AS builder
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . /app
RUN cd client && rm yarn.lock && npm install && npm run build && cd ..


FROM node:12 AS production
RUN npm install -g serve
WORKDIR /app
RUN ls -a
COPY --from=builder ./app/client/build ./client/build

EXPOSE 5000 3000

CMD ["npm", "run", "prod"]