#!/bin/bash

if [[ "${POLYGON_RPC_URL%%://*}" == "https" ]]
then export POLYGON_RPC_PROTOCOL="ssl"
else export POLYGON_RPC_PROTOCOL=""
fi

POLYGON_RPC_URL=${POLYGON_RPC_URL#*://}

export POLYGON_RPC_HOST="${POLYGON_RPC_URL%%/*}"
if [[ "$POLYGON_RPC_PROTOCOL" == "ssl" ]]
then export POLYGON_RPC_PORT="443"
else export POLYGON_RPC_PORT="80"
fi

if [[ "$POLYGON_RPC_URL" == *"/"* ]]
then export POLYGON_RPC_PATH="/${POLYGON_RPC_URL#*/}"
else export POLYGON_RPC_PATH="/"
fi

null_ui=localhost
EMAIL="${EMAIL:-noreply@gmail.com}"
WEBSERVER_URL="${WEBSERVER_URL:-$null_ui}"
WEBSERVER_URL="${WEBSERVER_URL#*://}"
SERVER_URL="${SERVER_URL:-server:8080}"
SERVER_URL="${SERVER_URL#*://}"
POLYGON_RPC_URL="${POLYGON_RPC_URL#https://}"

echo "Proxy container launched in env:"
echo "DOMAINNAME=${DOMAINNAME:-$null_ui}"
echo "EMAIL=$EMAIL"
echo "WEBSERVER_URL=$WEBSERVER_URL"
echo "SERVER_URL=$SERVER_URL"
echo "POLYGON_RPC_URL=$POLYGON_RPC_URL"
echo "POLYGON_RPC_HOST=$POLYGON_RPC_HOST"
echo "POLYGON_RPC_PATH=$POLYGON_RPC_PATH"
echo "POLYGON_RPC_PROTOCOL=$POLYGON_RPC_PROTOCOL"


# Provide a message indicating that we're still waiting for everything to wake up
function loading_msg {
  while true # unix.stackexchange.com/a/37762
  do echo -e "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\nWaiting for app to wake up" | nc -lk -p 80
  done > /dev/null
}
loading_msg &
loading_pid="$!"

########################################
# Wait for downstream services to wake up

webserver="${WEBSERVER_URL#*://}"
echo "waiting for $webserver..."
wait-for -q -t 60 "$webserver" 2>&1 | sed '/nc: bad address/d'
while ! curl -s "$WEBSERVER_URL" > /dev/null
do sleep 2
done
echo "Good morning $webserver"

server="${SERVER_URL#*://}"
echo "waiting for $server..."
wait-for -q -t 60 "$server" 2>&1 | sed '/nc: bad address/d'
while ! curl -s "$SERVER_URL" > /dev/null
do sleep 2
done
echo "Good morning $server"

# Kill the loading message server
kill "$loading_pid" && pkill nc

########################################
# If no domain name provided, start up in http mode

if [[ -z "$DOMAINNAME" ]]
then
  cp /etc/ssl/cert.pem ca-certs.pem
  echo "Entrypoint finished, executing haproxy in http mode..."; echo
  exec haproxy -db -f http.cfg
fi

########################################
# Setup SSL Certs

letsencrypt=/etc/letsencrypt/live
certsdir=$letsencrypt/$DOMAINNAME
mkdir -p /etc/haproxy/certs
mkdir -p /var/www/letsencrypt

if [[ "$DOMAINNAME" == "localhost" && ! -f "$certsdir/privkey.pem" ]]
then
  echo "Developing locally, generating self-signed certs"
  mkdir -p "$certsdir"
  openssl req -x509 -newkey rsa:4096 -keyout "$certsdir/privkey.pem" -out "$certsdir/fullchain.pem" -days 365 -nodes -subj '/CN=localhost'
fi

if [[ ! -f "$certsdir/privkey.pem" ]]
then
  echo "Couldn't find certs for $DOMAINNAME, using certbot to initialize those now.."
  certbot certonly --standalone -m "$EMAIL" --agree-tos --no-eff-email -d "$DOMAINNAME" -n --cert-name "$DOMAINNAME"
  code=$?
  if [[ "$code" -ne 0 ]]
  then
    echo "certbot exited with code $code, freezing to debug (and so we don't get throttled)"
    sleep 9999 # FREEZE! Don't pester eff & get throttled
    exit 1;
  fi
fi

echo "Using certs for $DOMAINNAME"

export CERTBOT_PORT=31820

function copycerts {
  if [[ -f $certsdir/fullchain.pem && -f $certsdir/privkey.pem ]]
  then cat "$certsdir/fullchain.pem" "$certsdir/privkey.pem" > "$DOMAINNAME.pem"
  else
    echo "Couldn't find certs, freezing to debug"
    sleep 9999;
    exit 1
  fi
}

# periodically fork off & see if our certs need to be renewed
function renewcerts {
  sleep 3 # give proxy a sec to wake up before attempting first renewal
  while true
  do
    echo -n "Preparing to renew certs... "
    if [[ -d "$certsdir" ]]
    then
      echo -n "Found certs to renew for $DOMAINNAME... "
      certbot renew -n --standalone --http-01-port=$CERTBOT_PORT
      copycerts
      echo "Done!"
    fi
    sleep 48h
  done
}

if [[ "$DOMAINNAME" != "localhost" ]]
then renewcerts &
fi

copycerts

cp /etc/ssl/cert.pem ca-certs.pem

echo "Entrypoint finished, executing haproxy in https mode..."; echo
exec haproxy -db -f https.cfg
