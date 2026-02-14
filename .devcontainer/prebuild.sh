#!/usr/bin/env bash
set -e

echo "[prebuild] Pre-pulling Docker images..."
docker pull datadog/agent:7 &
docker pull node:20-alpine &
docker pull alpine:3 &
docker pull nginx:alpine &
wait
echo "[prebuild] All images pulled."

echo "[prebuild] Pre-building demo containers..."
docker compose build
echo "[prebuild] Done."
