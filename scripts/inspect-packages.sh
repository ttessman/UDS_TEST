#!/usr/bin/env bash
set -euo pipefail

if [ -f server/.env ]; then
  set -a
  # shellcheck disable=SC1091
  source server/.env
  set +a
fi

refs="${UDS_REGISTRY_PACKAGE_REFS:-oci://ghcr.io/defenseunicorns/packages/uds/core:latest,oci://ghcr.io/defenseunicorns/packages/uds/podinfo:latest}"

IFS=',' read -r -a package_refs <<< "$refs"

for ref in "${package_refs[@]}"; do
  trimmed="$(echo "$ref" | xargs)"
  [ -z "$trimmed" ] && continue
  echo
  echo "Inspecting $trimmed"
  zarf package inspect definition "$trimmed"
done
