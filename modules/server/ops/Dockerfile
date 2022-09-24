FROM node:14.18.1-alpine3.14
WORKDIR /root
ENV HOME /root
ENV PATH $PATH:./node_modules/.bin:/root/node_modules/.bin
RUN apk add --update --no-cache bash curl g++ gcc git jq make python3
# npm 7.x.x doesn't seem to respect the --production flag so should we stick with 6.x.x?
RUN npm config set unsafe-perm true && npm install -g npm@8.17.0
RUN curl https://raw.githubusercontent.com/vishnubob/wait-for-it/ed77b63706ea721766a62ff22d3a251d8b4a6a30/wait-for-it.sh > /bin/wait-for && chmod +x /bin/wait-for

COPY package.json package.json
RUN npm install

COPY ops ops
COPY src src
COPY dist dist

ENTRYPOINT ["bash", "ops/entry.sh"]
