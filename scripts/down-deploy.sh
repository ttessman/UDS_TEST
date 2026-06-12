#!/usr/bin/env bash
set -euo pipefail

namespaces="${DOWN_DEPLOY_NAMESPACES:-catalog-poc}"
timeout="${DOWN_DEPLOY_TIMEOUT:-120s}"

if ! command -v kubectl >/dev/null 2>&1; then
  echo "kubectl not found; skipping deployed app cleanup."
  exit 0
fi

if ! kubectl cluster-info >/dev/null 2>&1; then
  echo "Kubernetes cluster is not reachable; skipping deployed app cleanup."
  exit 0
fi

echo "Removing repo-deployed app namespaces: ${namespaces}"

for namespace in ${namespaces}; do
  if kubectl get namespace "${namespace}" >/dev/null 2>&1; then
    kubectl delete namespace "${namespace}" \
      --ignore-not-found=true \
      --wait=true \
      --timeout="${timeout}"
  else
    echo "Namespace ${namespace} is not present"
  fi
done

echo "Deployed app cleanup complete."
