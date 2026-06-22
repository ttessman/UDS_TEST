#!/usr/bin/env bash
set -euo pipefail

timeout="${UDS_GATEWAY_REFRESH_TIMEOUT:-120s}"

gateways=(
  "istio-tenant-gateway/tenant-ingressgateway"
  "istio-admin-gateway/admin-ingressgateway"
)

echo "Refreshing UDS gateways so local routes use current Istio workload certificates"

for gateway in "${gateways[@]}"; do
  namespace="${gateway%/*}"
  deployment="${gateway#*/}"

  if ! kubectl -n "${namespace}" get "deployment/${deployment}" >/dev/null 2>&1; then
    echo "Skipping ${namespace}/${deployment}; deployment not found"
    continue
  fi

  echo "Restarting ${namespace}/${deployment}"
  kubectl -n "${namespace}" rollout restart "deployment/${deployment}"
  kubectl -n "${namespace}" rollout status "deployment/${deployment}" --timeout="${timeout}"
done
