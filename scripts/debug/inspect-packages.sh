#!/usr/bin/env bash
set -euo pipefail

if [ -f components/backend/.env ]; then
  set -a
  # shellcheck disable=SC1091
  source components/backend/.env
  set +a
fi

refs="${UDS_REGISTRY_PACKAGE_REFS:-}"

if [ -z "$refs" ]; then
  echo "No UDS_REGISTRY_PACKAGE_REFS configured."
  echo "For the Kubernetes POC, package refs are supplied to the backend by components/backend/manifests/configmap.yaml."
  exit 0
fi

IFS=',' read -r -a package_refs <<< "$refs"

for ref in "${package_refs[@]}"; do
  trimmed="$(echo "$ref" | xargs)"
  [ -z "$trimmed" ] && continue
  echo
  echo "Inspecting $trimmed"
  zarf package inspect definition "$trimmed"
done
