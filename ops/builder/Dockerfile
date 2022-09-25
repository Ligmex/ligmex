FROM node:18.9.0-alpine3.16
WORKDIR /root
ENV HOME /root
RUN apk add --update --no-cache bash curl g++ gcc git jq make openssl python3
RUN npm config set unsafe-perm true
RUN yarn global upgrade yarn@1.17.3
RUN yarn global add lerna@5.5.2
RUN yarn global add pino-pretty@9.1.0
RUN curl https://raw.githubusercontent.com/vishnubob/wait-for-it/ed77b63706ea721766a62ff22d3a251d8b4a6a30/wait-for-it.sh > /bin/wait-for && chmod +x /bin/wait-for

COPY entry.sh /entry.sh

ENV PATH $PATH:./node_modules/.bin:/root/node_modules/.bin
ENTRYPOINT ["bash", "/entry.sh"]
