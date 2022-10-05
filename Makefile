########################################
# Setup Env

# Specify make-specific variables (VPATH = prerequisite search path)
VPATH=.flags
SHELL=/bin/bash

root=$(shell cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )
project=$(shell cat $(root)/package.json | jq .name | tr -d '"')
find_options=-type f -not -path "**/node_modules/**" -not -path "**/.*" -not -path "**/dist/**"

cwd=$(shell pwd)
commit=$(shell git rev-parse HEAD | head -c 8)
semver=v$(shell cat package.json | grep '"version":' | awk -F '"' '{print $$4}')

# Helper functions
startTime=.flags/.startTime
totalTime=.flags/.totalTime
log_start=@echo "=============";echo "[Makefile] => Start building $@"; date "+%s" > $(startTime)
log_finish=@echo $$((`date "+%s"` - `cat $(startTime)`)) > $(totalTime); rm $(startTime); echo "[Makefile] => Finished building $@ in `cat $(totalTime)` seconds";echo "=============";echo

# Create output folders
$(shell mkdir -p .flags)

########################################
# Command & Control Aliases

default: dev
dev: proxy server-bundle
prod: proxy client server
all: dev prod

qs: quickstart
quickstart: node-modules
	yarn start

start: dev
	bash ops/start.sh

start-prod:
	export LIGMEX_PROD=true; bash ops/start.sh

start-agent:
	bash agent/bin/agent.sh console

stop:
	bash ops/stop.sh

restart: dev stop
	bash ops/start.sh

restart-prod: stop
	export LIGMEX_PROD=true; bash ops/start.sh

clean: stop
	docker container prune -f
	rm -rf .flags/*
	rm -rf .rollup.cache
	rm -rf build
	rm -rf dist
	rm -rf modules/**/.rollup.cache
	rm -rf modules/**/build
	rm -rf modules/**/dist

reset-images:
	rm -f .flags/proxy .flags/server .flags/client

purge: clean
	rm -rf package-lock.json

push: push-commit
push-commit:
	bash ops/push-images.sh $(commit)
push-semver:
	bash ops/tag-images.sh $(semver)
	bash ops/push-images.sh $(semver)

pull: pull-commit
pull-latest:
	bash ops/pull-images.sh latest
pull-commit:
	bash ops/pull-images.sh $(commit)
pull-semver:
	bash ops/pull-images.sh $(semver)

dls:
	@docker service ls && echo '=====' && docker container ls -a

lint:
	bash ops/lint.sh

deploy:
	bash ops/deploy.sh

deploy-fr:
	bash ops/deploy-fr.sh

########################################
# Common Prerequisites

node-modules: package.json modules/client/package.json modules/server/package.json
	$(log_start)
	earthly +deps
	$(log_finish) && mv -f $(totalTime) .flags/$@

########################################
# Typescript -> Javascript

client-bundle: node-modules $(shell find modules/client/src $(find_options))
	$(log_start)
	earthly +client-bundle
	$(log_finish) && mv -f $(totalTime) .flags/$@

server-bundle: node-modules $(shell find modules/server/src $(find_options))
	$(log_start)
	earthly +server-bundle
	$(log_finish) && mv -f $(totalTime) .flags/$@

########################################
# Build docker images

proxy: $(shell find ops/proxy $(find_options))
	$(log_start)
	earthly +proxy
	docker tag $(project)_proxy $(project)_proxy:$(commit)
	$(log_finish) && mv -f $(totalTime) .flags/$@

client: client-bundle $(shell find modules/client/ops $(find_options))
	$(log_start)
	earthly +client
	docker tag $(project)_webserver:latest $(project)_webserver:$(commit)
	$(log_finish) && mv -f $(totalTime) .flags/$@

server: server-bundle $(shell find modules/server/ops $(find_options))
	$(log_start)
	earthly +server
	docker tag $(project)_server:latest $(project)_server:$(commit)
	$(log_finish) && mv -f $(totalTime) .flags/$@
