#!/usr/bin/env bash

set -e

mkdir -p dist

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
    filename="podman-mcp-server-$os-$arch"
    if [ "$os" == "windows" ]; then
      filename="$filename.exe"
    fi
    curl -L -o "./dist/$filename" "https://github.com/manusa/podman-mcp-server/releases/download/v$1/$filename"
    chmod +x "./dist/$filename"
  done
done

