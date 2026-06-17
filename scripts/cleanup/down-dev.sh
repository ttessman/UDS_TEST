#!/usr/bin/env bash
set -euo pipefail

ports="${UDS_DEV_PORTS:-3001 5173}"

echo "Stopping local dev servers for ports: $ports"

for port in $ports; do
  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti "tcp:$port" 2>/dev/null || true)"
    if [ -n "$pids" ]; then
      echo "Stopping process(es) on port $port: $pids"
      # shellcheck disable=SC2086
      kill $pids 2>/dev/null || true
    else
      echo "No process found on port $port"
    fi
  else
    echo "lsof not found; cannot inspect port $port"
  fi
done

echo "Local dev server cleanup complete."
