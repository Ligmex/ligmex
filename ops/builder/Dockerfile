FROM node:16.17.0-alpine3.16
WORKDIR /root
ENV HOME /root
RUN apk add --update --no-cache bash curl g++ gcc git jq make openssl python3
RUN npm config set unsafe-perm true && npm install -g npm@8.5.0
RUN npm install -g pino-pretty@9.1.0
RUN npm install -g lerna@5.5.0
RUN curl https://raw.githubusercontent.com/vishnubob/wait-for-it/ed77b63706ea721766a62ff22d3a251d8b4a6a30/wait-for-it.sh > /bin/wait-for && chmod +x /bin/wait-for

COPY entry.sh /entry.sh

ENV PATH $PATH:./node_modules/.bin:/root/node_modules/.bin
ENTRYPOINT ["bash", "/entry.sh"]
