#!/usr/bin/env bash
# Post-start wrapper — called by postStartCommand AFTER git pull.
# Because git pull runs first, changes to THIS script take effect
# without rebuilding the Codespace (solves the chicken-and-egg problem
# where postStartCommand itself is baked at creation time).

DIR="$(cd "$(dirname "$0")" && pwd)"

bash "$DIR/setup-simple-browser-task.sh" || true
bash "$DIR/start-artifact-server.sh"
