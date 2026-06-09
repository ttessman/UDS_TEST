SHELL := /bin/bash

.DEFAULT_GOAL := help

.PHONY: help install env dev server client build typecheck start check-prereqs setup-macos verify-uds inspect-packages installed-packages deploy-core git-status

help:
	@printf "UDS Core local POC commands\n\n"
	@printf "Setup:\n"
	@printf "  make install             Install npm workspace dependencies\n"
	@printf "  make env                 Create server/.env from example if missing\n"
	@printf "  make setup-macos         Check/install macOS CLI prerequisites where possible\n"
	@printf "  make check-prereqs       Print prerequisite status\n\n"
	@printf "Run:\n"
	@printf "  make dev                 Start API and frontend dev servers\n"
	@printf "  make server              Start only Express API\n"
	@printf "  make client              Start only Vite frontend\n"
	@printf "  make start               Start compiled Express API\n\n"
	@printf "Verify/build:\n"
	@printf "  make typecheck           Run TypeScript checks\n"
	@printf "  make build               Build shared, server, and client\n"
	@printf "  make verify-uds          Verify UDS CLI, cluster reachability, Core namespace, Package CRs\n\n"
	@printf "UDS/Zarf helpers:\n"
	@printf "  make inspect-packages    Inspect configured UDS_REGISTRY_PACKAGE_REFS\n"
	@printf "  make installed-packages  Print installed Zarf Package CRs\n"
	@printf "  make deploy-core         Deploy official k3d-core-demo UDS Core bundle\n\n"

install:
	npm install

env:
	@if [ ! -f server/.env ]; then cp server/.env.example server/.env; echo "Created server/.env"; else echo "server/.env already exists"; fi

dev: env
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

setup-macos:
	./scripts/setup-macos.sh

verify-uds:
	./scripts/verify-uds.sh

inspect-packages: env
	./scripts/inspect-packages.sh

installed-packages:
	uds zarf tools kubectl get package -A -o json

deploy-core:
	./scripts/deploy-uds-core.sh

git-status:
	git status --short
