#!/usr/bin/env bash
# Idempotent artifact-server starter.
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Kill existing artifact-server if running
if pkill -f "node.*artifact-server\.js" 2>/dev/null; then
  echo "[start-artifact-server] Killed existing instance"
  sleep 1
fi

cd "$REPO_DIR"
nohup node artifact-server.js > /tmp/artifact-server.log 2>&1 &
echo "[start-artifact-server] Started (PID=$!, dir=$REPO_DIR, log=/tmp/artifact-server.log)"
