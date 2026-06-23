#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/../vars/load-vars.sh"

frontend_port="${UDS_POC_FRONTEND_PORT:-5173}"
backend_port="${UDS_POC_BACKEND_PORT:-3001}"
docs_port="${UDS_POC_DOCS_PORT:-3002}"

pids=()

stop_existing_port_forward() {
  local port="$1"
  local pids_on_port

  if ! command -v lsof >/dev/null 2>&1; then
    echo "lsof not found; cannot refresh existing listener on port ${port}."
    return 0
  fi

  pids_on_port="$(lsof -ti "tcp:${port}" 2>/dev/null || true)"
  if [ -z "${pids_on_port}" ]; then
    return 0
  fi

  while IFS= read -r pid; do
    local command

    [ -z "${pid}" ] && continue

    command="$(ps -p "${pid}" -o command= 2>/dev/null || true)"
    case "${command}" in
      *kubectl*port-forward*)
        echo "Stopping existing kubectl port-forward on localhost:${port} (pid ${pid})"
        kill "${pid}" 2>/dev/null || true
        ;;
      *)
        echo "Port ${port} is already used by a non-port-forward process:" >&2
        echo "  pid ${pid}: ${command}" >&2
        echo "Stop that process or set UDS_POC_*_PORT before running make up." >&2
        return 1
        ;;
    esac
  done <<< "${pids_on_port}"
}

cleanup() {
  for pid in "${pids[@]}"; do
    kill "${pid}" 2>/dev/null || true
  done
}

trap cleanup EXIT INT TERM

echo "Refreshing localhost port-forwards for Kubernetes-hosted POC apps"
stop_existing_port_forward "${frontend_port}"
stop_existing_port_forward "${backend_port}"
stop_existing_port_forward "${docs_port}"

echo "Starting localhost port-forwards for Kubernetes-hosted POC apps"
kubectl -n "${UDS_POC_PLATFORM_NAMESPACE}" port-forward svc/frontend "${frontend_port}:5173" &
pids+=("$!")

kubectl -n "${UDS_POC_PLATFORM_NAMESPACE}" port-forward svc/backend "${backend_port}:3001" &
pids+=("$!")

kubectl -n "${DOCS_NAMESPACE}" port-forward svc/docs "${docs_port}:3002" &
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
