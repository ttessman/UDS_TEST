SHELL := /bin/bash

.DEFAULT_GOAL := help

ROOT_DIR := ../..
WORKSPACE := @uds-poc/frontend

.PHONY: help install dev build typecheck preview

help:
	@printf "Frontend local authoring commands\n\n"
	@printf "  make install    Refresh root npm workspace dependencies\n"
	@printf "  make dev        Start local Vite dev server\n"
	@printf "  make build      Compile and build local Vite assets\n"
	@printf "  make typecheck  Run frontend TypeScript checks\n"
	@printf "  make preview    Preview built Vite assets\n"

install:
	cd "$(ROOT_DIR)" && npm install

dev:
	cd "$(ROOT_DIR)" && npm run dev -w "$(WORKSPACE)"

build:
	cd "$(ROOT_DIR)" && npm run build -w "$(WORKSPACE)"

typecheck:
	cd "$(ROOT_DIR)" && npm run typecheck -w "$(WORKSPACE)"

preview:
	cd "$(ROOT_DIR)" && npm run start -w "$(WORKSPACE)"
