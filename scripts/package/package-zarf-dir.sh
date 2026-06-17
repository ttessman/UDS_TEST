#!/usr/bin/env bash
set -euo pipefail

package_dir="${1:-}"
expected_archive="${2:-}"
zarf_arch="${ZARF_PACKAGE_ARCH:-}"
plain_http_flag=()

if [[ -z "${zarf_arch}" ]]; then
  case "$(uname -m)" in
    arm64|aarch64)
      zarf_arch="arm64"
      ;;
    x86_64|amd64)
      zarf_arch="amd64"
      ;;
    *)
      zarf_arch="$(uname -m)"
      ;;
  esac
fi

if [[ "${ZARF_PLAIN_HTTP:-false}" == "true" ]]; then
  plain_http_flag=(--plain-http)
fi

if [[ -z "${package_dir}" ]]; then
  echo "Usage: $0 <package-dir> [expected-archive]" >&2
  exit 1
fi

mkdir -p build

echo "Creating Zarf package from ${package_dir}"
zarf package create "${package_dir}" \
  --architecture "${zarf_arch}" \
  --confirm \
  --skip-sbom \
  --output build \
  "${plain_http_flag[@]}"

if [[ -n "${expected_archive}" ]]; then
  echo "Created ${expected_archive}"
fi
