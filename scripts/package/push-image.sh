#!/usr/bin/env bash
set -euo pipefail

image="${1:-}"
missing_hint="${2:-Build the image before pushing it.}"

if [[ -z "${image}" ]]; then
  echo "Usage: $0 <image> [missing-hint]" >&2
  exit 1
fi

if ! docker image inspect "${image}" >/dev/null 2>&1; then
  echo "Missing built image: ${image}" >&2
  echo "${missing_hint}" >&2
  exit 1
fi

echo "Pushing image ${image}"
docker push "${image}"
