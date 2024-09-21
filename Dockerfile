FROM node:20.16-alpine3.19

WORKDIR /build

COPY package*.json .

RUN npm ci --omit=dev && npm cache clean --force

COPY build .

EXPOSE 1400

CMD ["node","server.js"]