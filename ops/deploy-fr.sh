#!/bin/bash

ssh ligmex -t <<EOF

cd ligmex/;
source .env;
git fetch --all;
git checkout -f prod;
git pull origin prod;
docker login;
make pull-commit;
make restart-prod;

EOF
