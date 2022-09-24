FROM node:18.9.0-alpine3.16
WORKDIR /root
ENV HOME /root
ENV PATH $PATH:./node_modules/.bin:/root/node_modules/.bin
RUN apk add --update --no-cache bash curl g++ gcc git jq make python3
RUN curl https://raw.githubusercontent.com/vishnubob/wait-for-it/ed77b63706ea721766a62ff22d3a251d8b4a6a30/wait-for-it.sh > /bin/wait-for && chmod +x /bin/wait-for
RUN npm config set unsafe-perm true
RUN yarn global add pino-pretty@9.1.0

COPY package.json package.json
RUN yarn

COPY ops ops
COPY src src
COPY dist dist

ENTRYPOINT ["bash", "ops/entry.sh"]
