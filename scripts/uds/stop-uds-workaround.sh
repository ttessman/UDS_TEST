#!/usr/bin/env bash
set -euo pipefail

pattern='scripts/uds/deploy-uds-macos-workaround.sh'

if ! pids="$(pgrep -f "$pattern" 2>/dev/null)"; then
  echo "No macOS UDS workaround process found."
  exit 0
fi

echo "Stopping macOS UDS workaround process(es):"
printf "%s\n" "$pids"
kill $pids
echo "Stopped."
