#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/../vars/load-vars.sh"

frontend_port="${UDS_POC_FRONTEND_PORT:-5173}"
backend_port="${UDS_POC_BACKEND_PORT:-3001}"
docs_port="${UDS_POC_DOCS_PORT:-3002}"

pids=()

cleanup() {
  for pid in "${pids[@]}"; do
    kill "${pid}" 2>/dev/null || true
  done
}

trap cleanup EXIT INT TERM

echo "Starting localhost port-forwards for Kubernetes-hosted POC apps"
kubectl -n "${UDS_POC_PLATFORM_NAMESPACE}" port-forward svc/frontend "${frontend_port}:5173" &
pids+=("$!")

kubectl -n "${UDS_POC_PLATFORM_NAMESPACE}" port-forward svc/backend "${backend_port}:3001" &
pids+=("$!")

kubectl -n "${UDS_POC_DOCS_NAMESPACE}" port-forward svc/docs "${docs_port}:3002" &
pids+=("$!")

echo
echo "Frontend: http://localhost:${frontend_port}/"
echo "Frontend named URL: ${UDS_POC_APP_URL:-https://app.uds.dev/}"
echo "Backend:  http://localhost:${backend_port}/api/health"
echo "Docs named URL: ${UDS_POC_DOCS_URL:-https://docs.uds.dev/}"
echo "Docs via frontend proxy: http://localhost:${frontend_port}/docs/"
echo "Docs direct debug: http://localhost:${docs_port}/"
echo
echo "Press Ctrl+C to stop port-forwards."

wait
