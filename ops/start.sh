#!/bin/bash

source .env
name="vrplayground"
commit="latest"
registry="$VRPLAYGROUND_REGISTRY"
port=${1:-12345}

echo "Pulling $registry/$name:$commit"
docker pull "$registry/$name:$commit"
docker tag "$registry/$name:$commit" "$name:$commit"
docker tag "$name:$commit" "$name:latest"

if grep -qs "$name" <<<"$(docker container ls --filter 'status=running' --format '{{.Names}}')"
then
  echo "Stopping container $name"
  docker container stop $name
  docker container rm $name
fi

certs_dir="$(pwd)/.certs"
mkdir -p "$certs_dir"

echo "Running $name container in the background"
docker run \
  --name="$name" \
  --volume="$certs_dir:/etc/letsencrypt" \
  --publish="0.0.0.0:$port:443" \
  "$name:$commit" &
