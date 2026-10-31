#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export npm_config_cache="${npm_config_cache:-/workspace/.npm-cache}"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-/workspace/.cache}"
if [[ -n "${HTTPS_PROXY:-${https_proxy:-}}" ]]; then
  export npm_config_https_proxy="${HTTPS_PROXY:-${https_proxy:-}}"
fi
npm ci --no-audit --no-fund
npm run typecheck
npm test
