#!/usr/bin/env bash
set -euo pipefail

if [ -f server/.env ]; then
  set -a
  # shellcheck disable=SC1091
  source server/.env
  set +a
fi

bundle_ref="${UDS_CORE_BUNDLE_REF:-k3d-core-demo:latest}"

if ! command -v k3d >/dev/null 2>&1; then
  echo "k3d is required for the official local demo. Run: make setup-macos"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker must be running for the official k3d local demo."
  exit 1
fi

echo "Deploying UDS Core local demo bundle: $bundle_ref"
echo "Official demo docs: https://docs.defenseunicorns.com/core/getting-started/local-demo/overview/"
uds deploy "$bundle_ref" --confirm
./scripts/verify-uds.sh
