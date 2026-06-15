#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/catalog-poc-env.sh"

echo "Waiting for ${CATALOG_POC_NAME} deployment"
kubectl -n "${CATALOG_POC_NAMESPACE}" rollout status "deployment/${CATALOG_POC_NAME}" --timeout=180s

echo
echo "UDS Package"
kubectl -n "${CATALOG_POC_NAMESPACE}" get package "${CATALOG_POC_NAME}" -o wide

echo
echo "Endpoint"
kubectl -n "${CATALOG_POC_NAMESPACE}" get package "${CATALOG_POC_NAME}" -o jsonpath='{.status.endpoints[*]}'
echo
