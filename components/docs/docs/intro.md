---
sidebar_position: 1
slug: /overview
---

# POC Overview

This POC demonstrates a UDS-backed app catalog for deployable packages.

The core idea is simple: stop hardcoding application lists in the client. Let the backend read package metadata, installed Package CR state, and launch endpoints from the UDS/Zarf/Kubernetes layer the platform already uses.

The React frontend presents the resulting catalog. The Express backend owns UDS access and deployment actions. The docs app explains the product direction, run path, and technical model.

This is still a proof of concept. Registry package data and installed package data remain separate domains until real UDS metadata proves a combined model is useful.
