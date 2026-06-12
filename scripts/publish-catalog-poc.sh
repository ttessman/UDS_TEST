#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/catalog-poc-env.sh"

if [[ ! -f "${CATALOG_POC_PACKAGE_ARCHIVE}" ]]; then
  echo "Missing ${CATALOG_POC_PACKAGE_ARCHIVE}. Run make package-catalog-poc first." >&2
  exit 1
fi

echo "Publishing ${CATALOG_POC_PACKAGE_ARCHIVE} to oci://${CATALOG_POC_REGISTRY}/${CATALOG_POC_REPOSITORY}"
zarf package publish "${CATALOG_POC_PACKAGE_ARCHIVE}" "oci://${CATALOG_POC_REGISTRY}/${CATALOG_POC_REPOSITORY}" \
  --confirm \
  "${CATALOG_POC_PLAIN_HTTP_FLAG[@]}"

echo "Published ${CATALOG_POC_OCI_REF}"
echo "Configure the backend with: UDS_REGISTRY_PACKAGE_REFS=${CATALOG_POC_OCI_REF}"
