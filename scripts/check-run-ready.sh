#!/usr/bin/env bash
set -euo pipefail

failures=0

check_file() {
  local label="$1"
  local path="$2"
  local fix="$3"

  if [ -e "$path" ]; then
    printf "yes  %-18s %s\n" "$label" "$path"
  else
    printf "no   %-18s missing; %s\n" "$label" "$fix"
    failures=$((failures + 1))
  fi
}

check_command() {
  local label="$1"
  local command_name="$2"
  local fix="$3"

  if command -v "$command_name" >/dev/null 2>&1; then
    printf "yes  %-18s %s\n" "$label" "$(command -v "$command_name")"
  else
    printf "no   %-18s missing; %s\n" "$label" "$fix"
    failures=$((failures + 1))
  fi
}

echo "Run readiness"
check_file "server env" "server/.env" "run make setup or make env"
check_file "npm deps" "node_modules" "run make setup or make install"
check_command "UDS CLI" "uds" "run make setup"
check_command "kubectl" "kubectl" "run make setup"

if command -v uds >/dev/null 2>&1 && uds zarf tools kubectl cluster-info >/dev/null 2>&1; then
  printf "yes  %-18s reachable\n" "Kubernetes"
else
  printf "no   %-18s not reachable; run make deploy-uds before make run dev\n" "Kubernetes"
  failures=$((failures + 1))
fi

package_count="0"
if command -v uds >/dev/null 2>&1; then
  package_count="$(uds zarf tools kubectl get package -A -o json 2>/dev/null | node -e 'let input = ""; process.stdin.on("data", d => input += d); process.stdin.on("end", () => { try { const parsed = JSON.parse(input || "{\"items\":[]}"); console.log(Array.isArray(parsed.items) ? parsed.items.length : 0); } catch { console.log(0); } });' || printf "0")"
fi

if [ "$package_count" -gt 0 ]; then
  printf "yes  %-18s %s installed Package CR(s)\n" "UDS packages" "$package_count"
else
  printf "no   %-18s no installed Package CRs; run make deploy-uds or make deploy-uds-macos before make run dev\n" "UDS packages"
  failures=$((failures + 1))
fi

if [ "$failures" -gt 0 ]; then
  echo
  echo "Run preflight failed. Finish setup first:"
  echo "  make setup"
  echo "  make deploy-uds"
  echo "  # or, on affected macOS/k3d runtimes:"
  echo "  make deploy-uds-macos"
  exit 1
fi
