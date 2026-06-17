#!/usr/bin/env bash
set -euo pipefail

namespace="${1:-}"
shift || true

if [[ -z "${namespace}" || "$#" -eq 0 ]]; then
  echo "Usage: $0 <namespace> <deployment> [deployment...]" >&2
  exit 1
fi

for deployment in "$@"; do
  echo "Waiting for ${deployment} rollout in namespace ${namespace}"
  kubectl -n "${namespace}" rollout status "deployment/${deployment}" --timeout=180s
done
