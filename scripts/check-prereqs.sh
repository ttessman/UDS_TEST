#!/usr/bin/env bash
set -euo pipefail

mode="${1:-status}"
failures=0

required_status() {
  local name="$1"
  local command_name="$2"
  if command -v "$command_name" >/dev/null 2>&1; then
    printf "yes  %-18s %s\n" "$name" "$(command -v "$command_name")"
  else
    printf "no   %-18s missing\n" "$name"
    failures=$((failures + 1))
  fi
}

optional_status() {
  local name="$1"
  local command_name="$2"
  if command -v "$command_name" >/dev/null 2>&1; then
    printf "yes  %-18s %s\n" "$name" "$(command -v "$command_name")"
  else
    printf "no   %-18s missing\n" "$name"
  fi
}

printf "Prerequisites\n"
if [ "$mode" = "--setup" ]; then
  required_status "Homebrew" "brew"
  required_status "UDS CLI" "uds"
  required_status "Zarf CLI" "zarf"
  required_status "k3d" "k3d"
  required_status "kubectl" "kubectl"
else
  optional_status "Homebrew" "brew"
  optional_status "UDS CLI" "uds"
  optional_status "Zarf CLI" "zarf"
  optional_status "k3d" "k3d"
  optional_status "kubectl" "kubectl"
fi

if command -v docker >/dev/null 2>&1 && docker version >/dev/null 2>&1; then
  printf "yes  %-18s Docker reachable\n" "container runtime"
elif command -v limactl >/dev/null 2>&1; then
  if [ "$mode" = "--setup" ]; then
    printf "no   %-18s Docker is required for make deploy-core; limactl alone is not enough for this script\n" "container runtime"
    failures=$((failures + 1))
  else
    printf "yes  %-18s limactl installed\n" "container runtime"
  fi
else
  printf "no   %-18s Docker Desktop or Lima-compatible runtime missing/not reachable\n" "container runtime"
  if [ "$mode" = "--setup" ]; then
    failures=$((failures + 1))
  fi
fi

if [ "$mode" = "--setup" ] && [ "$failures" -gt 0 ]; then
  echo
  echo "Setup prerequisites failed. Fix the missing items above before continuing."
  exit 1
fi
