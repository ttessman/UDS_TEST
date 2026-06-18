---
sidebar_position: 99
---

# History & Notes

This POC started as a singular local app and was refactored into a containerized monorepo with separate frontend, backend, docs, and sample package areas.

The current direction is Kubernetes and UDS package structure, not Docker Compose. The root Makefile is intentionally focused on local UDS setup, image builds, Zarf packaging, registry publish, deploy, rollout, and debug.

Important open items:

- Confirm the stable registry catalog or package index source.
- Harden backend cluster permissions before treating browser-triggered installs as production-ready.
- Move user settings out of frontend `localStorage` if backend persistence and Prisma are added.
- Add Storybook journey links for the user and admin flows.
