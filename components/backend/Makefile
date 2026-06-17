SHELL := /bin/bash

.DEFAULT_GOAL := help

ROOT_DIR := ../..
WORKSPACE := @uds-poc/backend

.PHONY: help install env dev build typecheck start

help:
	@printf "Backend local authoring commands\n\n"
	@printf "  make install    Refresh root npm workspace dependencies\n"
	@printf "  make env        Create .env from .env.example when missing\n"
	@printf "  make dev        Start local Express API with tsx watch\n"
	@printf "  make build      Compile backend TypeScript\n"
	@printf "  make typecheck  Run backend TypeScript checks\n"
	@printf "  make start      Start compiled backend API\n"

install:
	cd "$(ROOT_DIR)" && npm install

env:
	@if [ ! -f .env ]; then cp .env.example .env; echo "Created components/backend/.env"; else echo "components/backend/.env already exists"; fi

dev: env
	cd "$(ROOT_DIR)" && npm run dev -w "$(WORKSPACE)"

build:
	cd "$(ROOT_DIR)" && npm run build -w "$(WORKSPACE)"

typecheck:
	cd "$(ROOT_DIR)" && npm run typecheck -w "$(WORKSPACE)"

start: build env
	cd "$(ROOT_DIR)" && npm run start -w "$(WORKSPACE)"
