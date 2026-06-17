#!/usr/bin/env bash
set -euo pipefail

archive="${1:-}"
namespace="${2:-}"
deployment="${3:-}"
plain_http_flag=()

if [[ "${ZARF_PLAIN_HTTP:-false}" == "true" ]]; then
  plain_http_flag=(--plain-http)
fi

if [[ -z "${archive}" ]]; then
  echo "Usage: $0 <package-archive> [namespace] [deployment]" >&2
  exit 1
fi

if [[ "${archive}" != oci://* && ! -f "${archive}" ]]; then
  echo "Missing ${archive}. Run the package target first." >&2
  exit 1
fi

echo "Deploying ${archive}"
zarf package deploy "${archive}" \
  --confirm \
  "${plain_http_flag[@]}"

if [[ -n "${namespace}" && -n "${deployment}" ]]; then
  echo "Waiting for ${deployment} rollout in namespace ${namespace}"
  kubectl -n "${namespace}" rollout status "deployment/${deployment}" --timeout=180s
fi
