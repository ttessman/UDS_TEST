#!/usr/bin/env bash
set -euo pipefail

archive="${1:-}"
oci_repository="${2:-}"
published_ref="${3:-}"
plain_http_flag=()

if [[ "${ZARF_PLAIN_HTTP:-false}" == "true" ]]; then
  plain_http_flag=(--plain-http)
fi

if [[ -z "${archive}" || -z "${oci_repository}" ]]; then
  echo "Usage: $0 <package-archive> [oci-repository] [published-ref]" >&2
  exit 1
fi

if [[ ! -f "${archive}" ]]; then
  echo "Missing ${archive}. Run the package target first." >&2
  exit 1
fi

echo "Publishing ${archive} to ${oci_repository}"
zarf package publish "${archive}" "${oci_repository}" \
  --confirm \
  "${plain_http_flag[@]}"

if [[ -n "${published_ref}" ]]; then
  echo "Published ${published_ref}"
fi
