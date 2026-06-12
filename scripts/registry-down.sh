#!/usr/bin/env bash
set -euo pipefail

REGISTRY_NAME="${REGISTRY_NAME:-uds-poc-registry}"

if docker ps -a --format '{{.Names}}' | grep -qx "${REGISTRY_NAME}"; then
  docker rm -f "${REGISTRY_NAME}" >/dev/null
  echo "Removed registry ${REGISTRY_NAME}"
else
  echo "Registry ${REGISTRY_NAME} is not present"
fi
