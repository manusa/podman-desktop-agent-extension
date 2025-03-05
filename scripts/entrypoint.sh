#!/usr/bin/env sh

set -e

cat <<EOF > /home/goose/.config/goose/config.yaml
GOOSE_PROVIDER: $GOOSE_PROVIDER
GOOSE_MODEL: $GOOSE_MODEL
extensions:
  podman-sse:
    enabled: false
    envs: {}
    name: podman-sse
    type: sse
    uri: http://host.containers.internal:$SSE_PORT/

EOF

