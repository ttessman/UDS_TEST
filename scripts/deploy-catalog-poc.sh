#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/catalog-poc-env.sh"

echo "Deploying ${CATALOG_POC_OCI_REF}"
zarf package deploy "${CATALOG_POC_OCI_REF}" \
  --confirm \
  "${CATALOG_POC_PLAIN_HTTP_FLAG[@]}"
