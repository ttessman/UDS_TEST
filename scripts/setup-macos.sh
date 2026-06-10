#!/usr/bin/env bash
set -euo pipefail

load_homebrew_path() {
  if [ -x /opt/homebrew/bin/brew ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [ -x /usr/local/bin/brew ]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi
}

load_homebrew_path

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew missing. Installing Homebrew with the official installer..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  load_homebrew_path
  if ! command -v brew >/dev/null 2>&1; then
    echo "Homebrew installed, but brew is still not on PATH. Open a new terminal or add Homebrew shellenv to your shell profile, then rerun make setup."
    exit 1
  fi
else
  echo "Homebrew already installed: $(command -v brew)"
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

if [ "${UDS_POC_FULL_SETUP:-false}" = "true" ] && ! docker info >/dev/null 2>&1; then
  echo "Docker Desktop must be installed and running before make setup can deploy the local UDS Core demo."
  exit 1
elif ! command -v docker >/dev/null 2>&1 && ! command -v limactl >/dev/null 2>&1; then
  echo "Install Docker Desktop or a Lima-compatible runtime before deploying UDS Core locally."
fi

if [ "${UDS_POC_FULL_SETUP:-false}" = "true" ]; then
  ./scripts/check-prereqs.sh --setup
else
  ./scripts/check-prereqs.sh
fi

if [ "${UDS_POC_FULL_SETUP:-false}" = "true" ]; then
  cat <<'EOF'

Local CLI prerequisite setup complete.
Continuing local repo setup. Deploy the UDS Core demo cluster separately with:
  make deploy-uds
EOF
else
  cat <<'EOF'

Local CLI prerequisite setup complete.
This target only handles local tools. To finish local repo setup, run:
  make setup

Then deploy the UDS Core demo cluster:
  make deploy-uds

Then start the app:
  make run dev

Expanded:
  make install
  make env
  make deploy-uds
  make verify-uds
EOF
fi
