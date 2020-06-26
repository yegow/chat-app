FROM node:12 AS builder
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
COPY . /app
RUN cd client && rm yarn.lock && npm install && npm run build && cd ..

FROM node:12
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/client/build ./client/build

EXPOSE 5000 3000

CMD ["npm", "run", "prod"]