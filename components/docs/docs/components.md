---
sidebar_position: 6
---

# Components

The repo is organized around deployable POC components.

## Frontend

`components/frontend/` is the React catalog UI. It renders Store entries, installed resource cards, filters, launch actions, and backend command output.

## Backend

`components/backend/` is the Express API and UDS integration boundary. It reads package metadata, reads Kubernetes Package CRs, and runs allowed UDS/Zarf actions from the server side.

## Docs

`components/docs/` is this Docusaurus app. It is independently containerized and deployed as its own package so it can appear in the catalog like other apps.

## Catalog POC

`components/catalog-poc/` is the sample installable package. It proves the local build, package, publish, deploy, and launch loop.

## Shared And Scripts

`shared/` contains cross-app TypeScript contracts. `scripts/` contains host-side Make helpers for local setup, UDS, registry, packaging, deployment, and debug operations.
