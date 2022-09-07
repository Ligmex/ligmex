#!/bin/bash

# Set default email & domain name
DOMAINNAME="${DOMAINNAME:-localhost}"
EMAIL="${EMAIL:-noreply@gmail.com}"
WEBSERVER_URL="${WEBSERVER_URL:-http://webserver:3000}"
POLYGON_RPC_URL="${POLYGON_RPC_URL:-http://ethprovider:8545}"
MODE="${MODE:-dev}"

echo "Proxy container launched in env:"
echo "DOMAINNAME=${DOMAINNAME:-$null_ui}"
echo "EMAIL=$EMAIL"
echo "WEBSERVER_URL=$WEBSERVER_URL"
echo "POLYGON_RPC_URL=$POLYGON_RPC_URL"

if [[ "$MODE" == "dev" && -f "/etc/nginx/dev.nginx.conf" ]]
then cp -f /etc/nginx/dev.nginx.conf /etc/nginx/nginx.conf
elif [[ "$MODE" == "prod" && -f "/etc/nginx/prod.nginx.conf" ]]
then cp -f /etc/nginx/prod.nginx.conf /etc/nginx/nginx.conf
fi

# Provide a message indicating that we're still waiting for everything to wake up
function loading_msg {
  while true # unix.stackexchange.com/a/37762
  do echo 'Waiting for the rest of the app to wake up..' | nc -lk -p 80
  done > /dev/null
}
loading_msg &
loading_pid="$!"

########################################
# Wait for downstream services to wake up
# Define service hostnames & ports we depend on

if [[ "$MODE" == "dev" ]]
then
  echo "waiting for ${WEBSERVER_URL#*://}..."
  bash wait-for.sh -t 60 "${WEBSERVER_URL#*://}" 2> /dev/null
fi

# Kill the loading message server
kill "$loading_pid" && pkill nc

########################################
# Setup SSL Certs

letsencrypt=/etc/letsencrypt/live
devcerts=$letsencrypt/localhost
mkdir -p $devcerts
mkdir -p /etc/certs
mkdir -p /var/www/letsencrypt

if [[ "$DOMAINNAME" == "localhost" && ! -f "$devcerts/privkey.pem" ]]
then
  echo "Developing locally, generating self-signed certs"
  openssl req -x509 -newkey rsa:4096 -keyout $devcerts/privkey.pem -out $devcerts/fullchain.pem -days 365 -nodes -subj '/CN=localhost'
fi

if [[ ! -f "$letsencrypt/$DOMAINNAME/privkey.pem" ]]
then
  echo "Couldn't find certs for $DOMAINNAME, using certbot to initialize those now.."
  certbot certonly --standalone -m "$EMAIL" --agree-tos --no-eff-email -d "$DOMAINNAME" -n
  [[ "$?" -eq 0 ]] || sleep 9999 # FREEZE! Don't pester eff & get throttled
fi

echo "Using certs for $DOMAINNAME"
ln -sf "$letsencrypt/$DOMAINNAME/privkey.pem" /etc/certs/privkey.pem
ln -sf "$letsencrypt/$DOMAINNAME/fullchain.pem" /etc/certs/fullchain.pem

# Hack way to implement variables in the nginx.conf file
sed -i 's/$hostname/'"$DOMAINNAME"'/' /etc/nginx/nginx.conf
sed -i 's|$WEBSERVER_URL|'"$WEBSERVER_URL"'|' /etc/nginx/nginx.conf
sed -i 's|$POLYGON_RPC_URL|'"$POLYGON_RPC_URL"'|' /etc/nginx/nginx.conf

# periodically fork off & see if our certs need to be renewed
function renewcerts {
  while true
  do
    echo -n "Preparing to renew certs... "
    if [[ -d "/etc/letsencrypt/live/$DOMAINNAME" ]]
    then
      echo -n "Found certs to renew for $DOMAINNAME... "
      certbot renew --webroot -w /var/www/letsencrypt/ -n
      echo "Done!"
    fi
    sleep 48h
  done
}

if [[ "$DOMAINNAME" != "localhost" ]]
then renewcerts &
fi

sleep 3 # give renewcerts a sec to do it's first check

echo "Entrypoint finished, executing nginx..."; echo
exec nginx
