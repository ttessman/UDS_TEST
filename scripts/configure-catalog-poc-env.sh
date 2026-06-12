#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/catalog-poc-env.sh"

ENV_FILE="${ENV_FILE:-server/.env}"

if [[ ! -f "${ENV_FILE}" ]]; then
  cp server/.env.example "${ENV_FILE}"
  echo "Created ${ENV_FILE}"
fi

upsert_env() {
  local key="$1"
  local value="$2"

  if grep -q "^${key}=" "${ENV_FILE}"; then
    perl -0pi -e "s#^${key}=.*\$#${key}=${value}#m" "${ENV_FILE}"
  else
    printf "\n%s=%s\n" "${key}" "${value}" >> "${ENV_FILE}"
  fi
}

upsert_env "UDS_REGISTRY_PACKAGE_REFS" "${CATALOG_POC_OCI_REF}"
upsert_env "UDS_POC_ENABLE_INSTALL" "true"

echo "Configured ${ENV_FILE}"
echo "UDS_REGISTRY_PACKAGE_REFS=${CATALOG_POC_OCI_REF}"
echo "UDS_POC_ENABLE_INSTALL=true"
