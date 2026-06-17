#!/usr/bin/env bash
set -euo pipefail

namespace="${1:-}"
shift || true

if [[ -z "${namespace}" || "$#" -eq 0 ]]; then
  echo "Usage: $0 <namespace> <deployment> [deployment...]" >&2
  exit 1
fi

for deployment in "$@"; do
  echo "Restarting ${deployment} rollout in namespace ${namespace}"
  kubectl -n "${namespace}" rollout restart "deployment/${deployment}"
done
