#!/bin/bash
set -e

dev_target="src/index.ts"
prod_target="dist/bundle.js"

# Log all env vars
echo "Starting server in env:"
echo "- LIGMEX_IPFS_URL=$LIGMEX_IPFS_URL"
echo "- LIGMEX_LOG_LEVEL=$LIGMEX_LOG_LEVEL"
echo "- LIGMEX_MAX_UPLOAD_SIZE=$LIGMEX_MAX_UPLOAD_SIZE"
echo "- LIGMEX_PORT=$LIGMEX_PORT"
echo "- LIGMEX_PROD=$LIGMEX_PROD"
echo "- LIGMEX_VIP_TOKEN=$LIGMEX_VIP_TOKEN"

if [[ -d "modules/server" ]]
then cd modules/server
fi

if [[ ! -f "$dev_target" && ! -f "$prod_target" ]]
then echo "Fatal: couldn't find file to run" && pwd && ls && exit 1
fi

########################################
## Launch the server

if [[ "$LIGMEX_PROD" == "true" ]]
then
  echo "Starting ligmex server in prod-mode"
  export NODE_ENV=production
  exec node --no-deprecation "$prod_target"
else
  echo "Starting ligmex server in dev-mode"
  export NODE_ENV=development
  if [[ -z "$(command -v nodemon)" ]]
  then
    echo "Install deps & mount the monorepo into this container before running in dev-mode"
    exit 1
  fi
  exec nodemon \
    --delay 1 \
    --exec "node -r ts-node/register" \
    --exitcrash \
    --experimental-modules \
    --ignore '**/*.swp' \
    --ignore '**/*.test.ts' \
    --legacy-watch \
    --polling-interval 1000 \
    --watch '**/*.ts' \
    "$dev_target"
fi
