#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -gt 0 ]; then
  ports=("$@")
else
  ports=(80 443)
fi

echo "Fixing UDS host ports: ${ports[*]}"
echo
echo "Step 1/2: remove project-owned local UDS/k3d leftovers and review shared ports"
./scripts/down-uds.sh

echo
echo "Step 2/2: re-check host ports"
if ./scripts/check-host-ports.sh "${ports[@]}"; then
  echo
  echo "UDS host ports are clear. Retry:"
  echo "  make deploy-uds"
else
  cat <<'EOF'

Project-owned cleanup finished, but at least one required port is still busy.
Use the exact docker stop / kill command printed above if that owner is safe to stop.

If you do not want to stop the owner and you are using the macOS workaround, use alternate ports:
  UDS_K3D_HTTP_PORT=8080 UDS_K3D_HTTPS_PORT=8443 make deploy-uds-macos
EOF
  exit 1
fi
