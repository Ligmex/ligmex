VERSION 0.6
FROM node:18.9.0-alpine3.16
WORKDIR /root
ENV HOME /root
RUN apk add --update --no-cache bash curl g++ gcc git jq make openssl python3
RUN yarn global upgrade yarn@1.17.3
RUN yarn global add lerna@5.5.2
RUN yarn global add pino-pretty@9.1.0
RUN curl https://raw.githubusercontent.com/vishnubob/wait-for-it/ed77b63706ea721766a62ff22d3a251d8b4a6a30/wait-for-it.sh > /bin/wait-for && chmod +x /bin/wait-for


deps:
  COPY package.json lerna.json ./
  COPY modules/client/package.json modules/client/yarn.lock ./modules/client/
  COPY modules/server/package.json modules/server/yarn.lock ./modules/server/
  RUN lerna bootstrap --no-progress
  COPY tsconfig.json ./tsconfig.json
  SAVE ARTIFACT package.json AS LOCAL ./package.json
  SAVE ARTIFACT modules/client/yarn.lock AS LOCAL ./modules/client/yarn.lock
  SAVE ARTIFACT modules/server/yarn.lock AS LOCAL ./modules/server/yarn.lock


client-bundle:
  FROM +deps
  COPY modules/client/tsconfig.json ./modules/client/tsconfig.json
  COPY modules/client/package.json ./modules/client/package.json
  COPY modules/client/public ./modules/client/public
  COPY modules/client/src ./modules/client/src
  RUN cd ./modules/client && yarn build
  SAVE ARTIFACT modules/client/build /build AS LOCAL ./modules/client/build

server-bundle:
  FROM +deps
  COPY modules/server/tsconfig.json ./modules/server/tsconfig.json
  COPY modules/server/rollup.config.js ./modules/server/rollup.config.js
  COPY modules/server/package.json ./modules/server/package.json
  COPY modules/server/src ./modules/server/src
  RUN cd ./modules/server && yarn build
  SAVE ARTIFACT modules/server/build /build AS LOCAL ./modules/server/build


client:
  FROM alpine:3.16
  WORKDIR /root
  ENV HOME /root
  RUN apk add --update --no-cache nginx && \
    ln -fs /dev/stdout /var/log/nginx/access.log && \
    ln -fs /dev/stdout /var/log/nginx/error.log
  COPY modules/client/ops/nginx.conf /etc/nginx/nginx.conf
  COPY +client-bundle/build /var/www/html
  ENTRYPOINT ["nginx"]
  SAVE IMAGE ligmex_client:latest

server:
  FROM node:18.9.0-alpine3.16
  WORKDIR /root
  ENV HOME /root
  RUN apk add --update --no-cache bash curl git
  RUN curl https://raw.githubusercontent.com/vishnubob/wait-for-it/ed77b63706ea721766a62ff22d3a251d8b4a6a30/wait-for-it.sh > /bin/wait-for && chmod +x /bin/wait-for
  COPY modules/server/ops/entry.sh ./entry.sh
  COPY +server-bundle/build ./build
  ENTRYPOINT ["bash", "entry.sh"]
  SAVE IMAGE ligmex_server:latest

proxy:
  FROM haproxy:2.6.6-alpine3.16
  WORKDIR /root
  ENV HOME /root
  USER root
  RUN apk add --update --no-cache bash ca-certificates certbot curl iputils openssl
  RUN curl https://raw.githubusercontent.com/vishnubob/wait-for-it/ed77b63706ea721766a62ff22d3a251d8b4a6a30/wait-for-it.sh > /bin/wait-for && chmod +x /bin/wait-for
  COPY ops/proxy/entry.sh ./entry.sh
  COPY ops/proxy/http.cfg ./http.cfg
  COPY ops/proxy/https.cfg ./https.cfg
  ENTRYPOINT ["bash", "./entry.sh"]
  SAVE IMAGE ligmex_proxy:latest
