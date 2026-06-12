#!/usr/bin/env bash
set -euo pipefail

echo "Waiting for catalog-poc deployment"
kubectl -n catalog-poc rollout status deployment/catalog-poc --timeout=180s

echo
echo "UDS Package"
kubectl -n catalog-poc get package catalog-poc -o wide

echo
echo "Endpoint"
kubectl -n catalog-poc get package catalog-poc -o jsonpath='{.status.endpoints[*]}'
echo
