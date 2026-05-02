#!/usr/bin/env bash
# Run Playwright with traffic routed through a local OWASP ZAP proxy so the HUD / History fills.
#
# Prerequisite: ZAP listening on HTTP proxy port (default 8080). Example:
#   docker run --rm -p 8080:8080 ghcr.io/zaproxy/zaproxy:stable zap.sh -daemon \
#     -host 0.0.0.0 -port 8080 -config api.disablekey=true
#
# Usage (from repo root):
#   ./scripts/run-playwright-with-zap.sh
#   ./scripts/run-playwright-with-zap.sh apps/web/tests/e2e/fortress.spec.ts

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PROXY="${PLAYWRIGHT_ZAP_PROXY:-http://127.0.0.1:8080}"
HOST_PORT="${PROXY#http://}"
HOST_PORT="${HOST_PORT#https://}"
HOST="${HOST_PORT%%:*}"
PORT="${HOST_PORT##*:}"

if [[ "$HOST_PORT" == "$PORT" ]]; then
  PORT="8080"
fi

if ! command -v nc >/dev/null 2>&1; then
  echo "netcat (nc) not found; install it or ensure ZAP is reachable at ${PROXY}"
  exit 1
fi

if ! nc -z "$HOST" "$PORT" 2>/dev/null; then
  echo "Nothing accepting TCP on ${HOST}:${PORT} — start ZAP first, then retry."
  echo "Example:"
  echo '  docker run --rm -p 8080:8080 ghcr.io/zaproxy/zaproxy:stable zap.sh -daemon \'
  echo '    -host 0.0.0.0 -port 8080 -config api.disablekey=true'
  exit 1
fi

export PLAYWRIGHT_ZAP_PROXY="$PROXY"
echo "Using PLAYWRIGHT_ZAP_PROXY=${PLAYWRIGHT_ZAP_PROXY}"
exec bun run test "$@"
