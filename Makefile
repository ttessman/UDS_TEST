SHELL := /bin/bash

.DEFAULT_GOAL := help

.PHONY: help install env dev run run-dev server client build typecheck start check-prereqs check-run-ready setup setup-macos deploy-uds deploy-uds-macos fix-uds-ports stop-uds-workaround down down-dev down-uds setup-uds setup-dev setup-local-demo verify-uds uds-debug inspect-packages installed-packages deploy-core git-status

help:
	@printf "UDS Core local POC commands\n\n"
	@printf "Hard start from fresh macOS:\n"
	@printf "  make setup && make deploy-uds && make run dev\n\n"
	@printf "Setup:\n"
	@printf "  make setup               Set up local tools, npm dependencies, and env file\n"
	@printf "  make deploy-uds          Deploy and verify the official UDS Core local demo\n"
	@printf "  make deploy-uds-macos    Experimental macOS seccomp workaround deploy\n"
	@printf "  make fix-uds-ports       Clean project k3d leftovers and re-check ports 80/443\n"
	@printf "  make stop-uds-workaround Stop a stale macOS workaround deploy/watcher process\n"
	@printf "  make down                Stop dev servers and delete local UDS/k3d cluster\n"
	@printf "  make down-dev            Stop local dev servers only\n"
	@printf "  make down-uds            Delete local UDS/k3d cluster only\n"
	@printf "  make install             Install npm workspace dependencies\n"
	@printf "  make env                 Create server/.env from example if missing\n"
	@printf "  make setup-macos         Check/install local CLI prerequisites only\n"
	@printf "  make setup-local-demo    Alias for deploy-uds\n"
	@printf "  make check-prereqs       Print local tool prerequisite status\n\n"
	@printf "Run:\n"
	@printf "  make run dev             Check setup, then start API and frontend dev servers\n"
	@printf "  make dev                 Alias for make run dev\n"
	@printf "  make run-dev             Alias for make run dev\n"
	@printf "  make server              Start only Express API\n"
	@printf "  make client              Start only Vite frontend\n"
	@printf "  make start               Start compiled Express API\n\n"
	@printf "Verify/build:\n"
	@printf "  make typecheck           Run TypeScript checks\n"
	@printf "  make build               Build shared, server, and client\n"
	@printf "  make check-run-ready     Verify setup completed before running dev servers\n"
	@printf "  make verify-uds          Verify UDS CLI, cluster reachability, Core namespace, Package CRs\n"
	@printf "  make uds-debug           Print a focused UDS/k3d deploy debugging snapshot\n\n"
	@printf "UDS/Zarf helpers:\n"
	@printf "  make inspect-packages    Inspect configured UDS_REGISTRY_PACKAGE_REFS\n"
	@printf "  make installed-packages  Print installed Zarf Package CRs\n"
	@printf "  make deploy-core         Deploy official k3d-core-demo UDS Core bundle\n\n"

install:
	npm install

env:
	@if [ ! -f server/.env ]; then cp server/.env.example server/.env; echo "Created server/.env"; else echo "server/.env already exists"; fi

dev:
	@if [ "$(firstword $(MAKECMDGOALS))" = "run" ]; then :; else $(MAKE) run-dev; fi

run:
	@if [ "$(word 2,$(MAKECMDGOALS))" = "dev" ]; then \
		$(MAKE) run-dev; \
	else \
		echo "Usage: make run dev"; \
		exit 1; \
	fi

run-dev: env check-run-ready
	npm run dev

server: env
	npm run dev -w server

client:
	npm run dev -w client

build:
	npm run build

typecheck:
	npm run typecheck

start: build env
	npm run start

check-prereqs:
	./scripts/check-prereqs.sh

check-run-ready:
	./scripts/check-run-ready.sh

setup-macos:
	./scripts/setup-macos.sh

setup:
	@echo "Setup phase 1/3: local CLI prerequisites"
	UDS_POC_FULL_SETUP=true ./scripts/setup-macos.sh
	@echo "Setup phase 2/3: npm dependencies"
	$(MAKE) install
	@echo "Setup phase 3/3: local environment file"
	$(MAKE) env
	@echo "Local setup complete. Next: make deploy-uds"

deploy-uds:
	@echo "UDS deploy: official UDS Core local demo"
	$(MAKE) deploy-core
	@echo "UDS deploy complete. Run: make run dev"

deploy-uds-macos:
	./scripts/deploy-uds-macos-workaround.sh

fix-uds-ports:
	./scripts/fix-uds-ports.sh

stop-uds-workaround:
	./scripts/stop-uds-workaround.sh

down: down-dev down-uds

down-dev:
	./scripts/down-dev.sh

down-uds:
	./scripts/down-uds.sh

setup-dev: setup

setup-uds: deploy-uds

setup-local-demo: deploy-uds

verify-uds:
	./scripts/verify-uds.sh

uds-debug:
	./scripts/uds-debug.sh

inspect-packages: env
	./scripts/inspect-packages.sh

installed-packages:
	uds zarf tools kubectl get package -A -o json

deploy-core:
	./scripts/deploy-uds-core.sh

git-status:
	git status --short
