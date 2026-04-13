#!/usr/bin/env bash
set -e

# 1) Compute setup token from API keys (same SHA-256 hash as home page)
SETUP_TOKEN=""
if [ -n "$DATADOG_API_KEY" ] && [ -n "$DATADOG_APP_KEY" ]; then
  SETUP_TOKEN=$(node -e "process.stdout.write(require('crypto').createHash('sha256').update(process.argv[1]+':'+process.argv[2]).digest('hex'))" "$DATADOG_API_KEY" "$DATADOG_APP_KEY")
fi

# 2) Build Simple Browser URL
CODESPACE="${CODESPACE_NAME:-local}"
BROWSER_URL="https://dd-tse-fix-it-faster.vercel.app/challenges?codespace=$(node -e "process.stdout.write(encodeURIComponent(process.argv[1]))" "$CODESPACE")"
if [ -n "$SETUP_TOKEN" ]; then
  BROWSER_URL="${BROWSER_URL}&setup=${SETUP_TOKEN}"
fi

# 3) Generate .vscode/tasks.json (Node avoids sed escaping issues)
mkdir -p .vscode
node -e "
const fs = require('fs');
const tmpl = fs.readFileSync('.devcontainer/tasks.json.template', 'utf8');
fs.writeFileSync('.vscode/tasks.json', tmpl.replace('__BROWSER_URL__', process.argv[1]));
" "$BROWSER_URL"
echo "[setup] .vscode/tasks.json created (codespace: ${CODESPACE}, token: ${SETUP_TOKEN:+present})"

# 4) Auto-create .env.local from Codespace secrets
if [ ! -f .env.local ] && [ -n "$DATADOG_API_KEY" ]; then
  echo "DATADOG_API_KEY=${DATADOG_API_KEY}" > .env.local
  [ -n "$DATADOG_APP_KEY" ] && echo "DATADOG_APP_KEY=${DATADOG_APP_KEY}" >> .env.local
  [ -n "$DATADOG_SITE" ] && echo "DATADOG_SITE=${DATADOG_SITE}" >> .env.local
  echo "[setup] .env.local created from Codespace secrets"

  echo "[setup] Running up:full..."
  npm run up && npm run pipeline:setup || true
  echo "[setup] Environment ready"
fi
