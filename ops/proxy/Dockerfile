FROM alpine:3.16

RUN apk add --update --no-cache bash certbot curl iputils nginx openssl && \
    openssl dhparam -out /etc/ssl/dhparam.pem 2048 && \
    ln -fs /dev/stdout /var/log/nginx/access.log && \
    ln -fs /dev/stdout /var/log/nginx/error.log

# https://github.com/moby/moby/issues/37965#issuecomment-426853382
COPY dev.conf /etc/nginx/dev.nginx.conf
COPY prod.conf /etc/nginx/prod.nginx.conf
COPY entry.sh /root/entry.sh

ENTRYPOINT ["bash", "/root/entry.sh"]
