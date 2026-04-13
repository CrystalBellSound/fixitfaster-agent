#!/usr/bin/env bash
set -e
mkdir -p .vscode
sed "s/\${CODESPACE_NAME}/${CODESPACE_NAME:-local}/g" \
  .devcontainer/tasks.json.template > .vscode/tasks.json
echo "[devcontainer] Created .vscode/tasks.json (codespace: ${CODESPACE_NAME:-local})"
