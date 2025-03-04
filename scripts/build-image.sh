#!/usr/bin/env bash

set -e

IMAGE=$1
TAG=$2

declare -a oses=(
  "linux"
  "darwin"
  "windows"
)

declare -a archs=(
  "amd64"
  "arm64"
)

for os in "${oses[@]}"
do
  for arch in "${archs[@]}"
  do
    echo "Building $os/$arch"
    podman build \
      --platform "$os/$arch" \
      --build-arg OS="$os" \
      --build-arg ARCH="$arch" \
      -f Containerfile.extension \
      -t "$IMAGE:$TAG-$os-$arch" \
      .
    podman push \
      "$IMAGE:$TAG-$os-$arch"
  done
done

podman manifest create \
  "$IMAGE:$TAG" \
  "$IMAGE:$TAG-linux-amd64" \
  "$IMAGE:$TAG-linux-arm64" \
  "$IMAGE:$TAG-darwin-amd64" \
  "$IMAGE:$TAG-darwin-arm64" \
  "$IMAGE:$TAG-windows-amd64" \
  "$IMAGE:$TAG-windows-arm64"

podman manifest push \
  "$IMAGE:$TAG"
