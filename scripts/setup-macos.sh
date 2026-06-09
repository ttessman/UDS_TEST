#!/usr/bin/env bash
set -euo pipefail

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is required. Install it from https://brew.sh/, then rerun this script."
  exit 1
fi

if ! command -v uds >/dev/null 2>&1; then
  brew tap defenseunicorns/tap
  brew install uds
else
  echo "UDS CLI already installed: $(command -v uds)"
fi

if ! command -v k3d >/dev/null 2>&1; then
  brew install k3d
else
  echo "k3d already installed: $(command -v k3d)"
fi

if ! command -v kubectl >/dev/null 2>&1; then
  brew install kubectl
else
  echo "kubectl already installed: $(command -v kubectl)"
fi

if ! command -v docker >/dev/null 2>&1 && ! command -v limactl >/dev/null 2>&1; then
  echo "Install Docker Desktop or a Lima-compatible runtime before deploying UDS Core locally."
fi

./scripts/check-prereqs.sh
