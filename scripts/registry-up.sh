#!/usr/bin/env bash
set -euo pipefail

REGISTRY_NAME="${REGISTRY_NAME:-uds-poc-registry}"
REGISTRY_PORT="${REGISTRY_PORT:-5001}"

if docker ps --format '{{.Names}}' | grep -qx "${REGISTRY_NAME}"; then
  echo "Registry ${REGISTRY_NAME} is already running on localhost:${REGISTRY_PORT}"
  exit 0
fi

if docker ps -a --format '{{.Names}}' | grep -qx "${REGISTRY_NAME}"; then
  docker start "${REGISTRY_NAME}" >/dev/null
  echo "Started existing registry ${REGISTRY_NAME} on localhost:${REGISTRY_PORT}"
  exit 0
fi

docker run -d \
  --name "${REGISTRY_NAME}" \
  -p "${REGISTRY_PORT}:5000" \
  registry:2 >/dev/null

echo "Started registry ${REGISTRY_NAME} on localhost:${REGISTRY_PORT}"
