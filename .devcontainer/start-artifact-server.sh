#!/usr/bin/env bash
# Idempotent artifact-server starter.
# Kills any existing instance, then starts a new one with nohup
# so it survives the parent shell exiting.

# Kill existing artifact-server if running
if pkill -f "node.*artifact-server\.js" 2>/dev/null; then
  echo "[start-artifact-server] Killed existing instance"
  sleep 1
fi

nohup node artifact-server.js > /tmp/artifact-server.log 2>&1 &
echo "[start-artifact-server] Started (PID=$!, log=/tmp/artifact-server.log)"
