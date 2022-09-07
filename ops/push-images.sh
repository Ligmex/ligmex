#!/usr/bin/env bash
set -e

root=$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )
project=$(grep -m 1 '"name":' "$root/package.json" | cut -d '"' -f 4)
registry=$(grep -m 1 '"registry":' "$root/package.json" | cut -d '"' -f 4)
commit=$(git rev-parse HEAD | head -c 8)

for name in builder proxy webserver
do
  image=${project}_$name
  for version in ${1:-$commit latest}
  do
    echo "Tagging image $image:$version as $registry/$image:$version"
    docker tag "$image:$version" "$registry/$image:$version" || true
    echo "Pushing image: $registry/$image:$version"
    docker push "$registry/$image:$version" || true
  done
done