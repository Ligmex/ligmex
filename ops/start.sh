#!/usr/bin/env bash
set -e

root=$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )
project=$(grep -m 1 '"name":' "$root/package.json" | cut -d '"' -f 4)

# turn on swarm mode if it's not already on
docker swarm init 2> /dev/null || true
docker network create --attachable --driver overlay "$project" 2> /dev/null || true

if grep -qs "$project" <<<"$(docker stack ls | tail -n +2)"
then echo "$project stack is already running" && exit
fi
    
####################
# External Env Vars

# shellcheck disable=SC1091
if [[ -f .env ]]; then source .env; fi

LIGMEX_POLYGON_RPC_URL="${LIGMEX_POLYGON_RPC_URL:-}"
LIGMEX_DOMAINNAME="${LIGMEX_DOMAINNAME:-}"
LIGMEX_EMAIL="${LIGMEX_EMAIL:-noreply@gmail.com}"
LIGMEX_PORT="${LIGMEX_PORT:-3000}"
LIGMEX_PROD="${LIGMEX_PROD:-false}"
LIGMEX_SEMVER="${LIGMEX_SEMVER:-false}"

# If semver flag is given, we should ensure the prod flag is also active
if [[ "$LIGMEX_SEMVER" == "true" ]]
then export LIGMEX_PROD=true
fi

echo "Launching $project in env:"
echo "- LIGMEX_POLYGON_RPC_URL=$LIGMEX_POLYGON_RPC_URL"
echo "- LIGMEX_DOMAINNAME=$LIGMEX_DOMAINNAME"
echo "- LIGMEX_EMAIL=$LIGMEX_EMAIL"
echo "- LIGMEX_PORT=$LIGMEX_PORT"
echo "- LIGMEX_PROD=$LIGMEX_PROD"
echo "- LIGMEX_SEMVER=$LIGMEX_SEMVER"

####################
# Misc Config

commit=$(git rev-parse HEAD | head -c 8)
semver="v$(grep -m 1 '"version":' "$root/package.json" | cut -d '"' -f 4)"
if [[ "$LIGMEX_SEMVER" == "true" ]]
then version="$semver"
elif [[ "$LIGMEX_PROD" == "true" ]]
then version="$commit"
else version="latest"
fi

common="networks:
      - '$project'
    logging:
      driver: 'json-file'
      options:
          max-size: '100m'"

########################################
# Webserver config

webserver_internal_port=3000

if [[ "$LIGMEX_PROD" == "true" ]]
then
  webserver_image="${project}_webserver:$version"
  webserver_service="webserver:
    image: '$webserver_image'
    $common"

else
  webserver_image="${project}_builder:$version"
  webserver_service="webserver:
    image: '$webserver_image'
    $common
    entrypoint: 'npm start'
    environment:
      NODE_ENV: 'development'
    volumes:
      - '$root:/root'
    working_dir: '/root'"

fi
bash "$root/ops/pull-images.sh" "$webserver_image"

########################################
# Proxy config

proxy_image="${project}_proxy:$version"
bash "$root/ops/pull-images.sh" "$proxy_image"

if [[ -n "$LIGMEX_DOMAINNAME" ]]
then
  public_url="https://$LIGMEX_DOMAINNAME:433"
  proxy_ports="ports:
      - '80:80'
      - '443:443'"
  echo "${project}_proxy will be exposed on *:80 and *:443"

else
  public_port=${LIGMEX_PORT:-3000}
  public_url="https://127.0.0.1:$public_port"
  proxy_ports="ports:
      - '$public_port:443'"
  echo "${project}_proxy will be exposed on *:$public_port"
fi

####################
# Launch It

docker_compose=$root/.docker-compose.yml
rm -f "$docker_compose"
cat - > "$docker_compose" <<EOF
version: '3.4'

networks:
  $project:
    external: true

volumes:
  data:
  certs:

services:

  proxy:
    image: '$proxy_image'
    $common
    $proxy_ports
    environment:
      DOMAINNAME: '$LIGMEX_DOMAINNAME'
      EMAIL: '$LIGMEX_EMAIL'
      WEBSERVER_URL: 'http://webserver:$webserver_internal_port'
      POLYGON_RPC_URL: '$LIGMEX_POLYGON_RPC_URL'
    volumes:
      - 'certs:/etc/letsencrypt'

  $webserver_service

EOF

docker stack deploy -c "$docker_compose" "$project"

echo "The $project stack has been deployed, waiting for $public_url to start responding.."
timeout=$(( $(date +%s) + 120 ))
while true
do
  res=$(curl -k -m 5 -s "$public_url" || true)
  if [[ -z "$res" || "$res" == *"Waiting for proxy to wake up"* ]]
  then
    if [[ "$(date +%s)" -gt "$timeout" ]]
    then echo "Timed out waiting for $public_url to respond.." && exit
    else sleep 2
    fi
  else echo "Good Morning!"; break;
  fi
done

# Delete old images in prod to prevent the disk from filling up (only on prod server)
if [[ "$LIGMEX_PROD" == "true" && "$(hostname)" == "$LIGMEX_DOMAINNAME" ]]
then
  docker container prune --force;
  echo "Removing ${project} images that aren't tagged as $commit or $semver or latest"

  mapfile -t imagesToKeep < <(docker image ls \
    | grep "${project}" \
    | awk '{ print $3"-"$2}' \
    | sort \
    | grep -E "(latest|$commit|$semver)" \
    | cut -d "-" -f 1 \
    | sort -u \
  )

  for image in $(docker image ls -q | sort -u)
  do
    if ! grep -qs "$image" <<<"${imagesToKeep[*]}"
    then
      # It's hard to detect images w dependents, just rm them & fail gracefully if not possible
      docker image rm --force "$image" || true
    fi
  done
fi
