FROM docker.io/node:22-bullseye AS builder

COPY . /extension

WORKDIR /extension

RUN npm install  && \
    npm run build

FROM scratch

LABEL org.opencontainers.image.title="Podman Desktop Agent" \
        org.opencontainers.image.description="Podman Desktop Agent" \
        org.opencontainers.image.vendor="Marc Nuri - www.marcnuri.com" \
        io.podman-desktop.api.version=">= 1.17.0"

COPY --from=builder /extension/ /extension/
