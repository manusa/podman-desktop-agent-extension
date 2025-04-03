#!/usr/bin/env sh

set -e

cat <<EOF > /home/goose/.config/goose/config.yaml
GOOSE_PROVIDER: $GOOSE_PROVIDER
GOOSE_MODEL: $GOOSE_MODEL
extensions:
  mcp-sse:
    enabled: $SSE_ENABLED
    envs: {}
    name: mcp-sse
    type: sse
    uri: http://$SSE_HOST:$SSE_PORT/sse

EOF

