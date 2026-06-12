#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/catalog-poc-env.sh"

mkdir -p "${CATALOG_POC_BUILD_DIR}" build

echo "Building image ${CATALOG_POC_IMAGE}"
docker build \
  --platform "linux/${CATALOG_POC_ARCH}" \
  -t "${CATALOG_POC_IMAGE}" \
  -f "${CATALOG_POC_PACKAGE_DIR}/app/Dockerfile" \
  "${CATALOG_POC_PACKAGE_DIR}/app"

echo "Pushing image ${CATALOG_POC_IMAGE}"
docker push "${CATALOG_POC_IMAGE}"

echo "Creating Zarf package ${CATALOG_POC_PACKAGE_ARCHIVE}"
zarf package create "${CATALOG_POC_PACKAGE_DIR}" \
  --architecture "${CATALOG_POC_ARCH}" \
  --confirm \
  --skip-sbom \
  --output build \
  "${CATALOG_POC_PLAIN_HTTP_FLAG[@]}"

echo "Created ${CATALOG_POC_PACKAGE_ARCHIVE}"
