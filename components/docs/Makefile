SHELL := /bin/bash

.DEFAULT_GOAL := help

ROOT_DIR := ../..
WORKSPACE := @uds-poc/docs

.PHONY: help install dev start build serve

help:
	@printf "Docs local authoring commands\n\n"
	@printf "  make install  Refresh root npm workspace dependencies\n"
	@printf "  make dev      Start local Docusaurus dev server\n"
	@printf "  make start    Alias for make dev\n"
	@printf "  make build    Build static Docusaurus output\n"
	@printf "  make serve    Serve built Docusaurus output locally\n"

install:
	cd "$(ROOT_DIR)" && npm install

dev:
	cd "$(ROOT_DIR)" && npm run start -w "$(WORKSPACE)"

start: dev

build:
	cd "$(ROOT_DIR)" && npm run build -w "$(WORKSPACE)"

serve:
	cd "$(ROOT_DIR)" && npm run serve -w "$(WORKSPACE)"
