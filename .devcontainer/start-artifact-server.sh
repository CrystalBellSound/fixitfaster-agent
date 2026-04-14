#!/usr/bin/env bash
# Idempotent artifact-server starter — auto-restarts on crash.
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="/tmp/artifact-server-wrapper.pid"

# Kill existing wrapper and node process
if [ -f "$PID_FILE" ]; then
  WPID=$(cat "$PID_FILE")
  kill "$WPID" 2>/dev/null && echo "[start-artifact-server] Killed wrapper PID=$WPID"
  rm -f "$PID_FILE"
fi
pkill -f "node.*artifact-server\.js" 2>/dev/null
sleep 1

# Start in a restart loop so crashes are self-healing
(
  while true; do
    echo "[artifact-server] starting at $(date)"
    node "$REPO_DIR/artifact-server.js"
    EXIT=$?
    echo "[artifact-server] exited (code=$EXIT) — restarting in 5s"
    sleep 5
  done
) >> /tmp/artifact-server.log 2>&1 &

echo $! > "$PID_FILE"
echo "[start-artifact-server] wrapper PID=$(cat $PID_FILE) dir=$REPO_DIR log=/tmp/artifact-server.log"
