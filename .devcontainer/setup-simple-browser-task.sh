#!/usr/bin/env bash
set -e

# 1) Generate .vscode/tasks.json with codespace name
mkdir -p .vscode
sed "s/\${CODESPACE_NAME}/${CODESPACE_NAME:-local}/g" \
  .devcontainer/tasks.json.template > .vscode/tasks.json
echo "[setup] .vscode/tasks.json created (codespace: ${CODESPACE_NAME:-local})"

# 2) Auto-create .env.local from Codespace secrets (if set via creation URL)
if [ ! -f .env.local ] && [ -n "$DATADOG_API_KEY" ]; then
  echo "DATADOG_API_KEY=${DATADOG_API_KEY}" > .env.local
  [ -n "$DATADOG_APP_KEY" ] && echo "DATADOG_APP_KEY=${DATADOG_APP_KEY}" >> .env.local
  [ -n "$DATADOG_SITE" ] && echo "DATADOG_SITE=${DATADOG_SITE}" >> .env.local
  echo "[setup] .env.local created from Codespace secrets"

  # 3) Auto-start everything
  echo "[setup] Running up:full..."
  npm run up && npm run pipeline:setup || true
  echo "[setup] Environment ready"
fi
