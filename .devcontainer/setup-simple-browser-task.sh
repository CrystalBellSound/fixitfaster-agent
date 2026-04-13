#!/usr/bin/env bash
set -e

CODESPACE="${CODESPACE_NAME:-local}"
BROWSER_URL="https://dd-tse-fix-it-faster.vercel.app/challenges?codespace=$(node -e "process.stdout.write(encodeURIComponent(process.argv[1]))" "$CODESPACE")"

mkdir -p .vscode
node -e "
const fs = require('fs');
const tmpl = fs.readFileSync('.devcontainer/tasks.json.template', 'utf8');
fs.writeFileSync('.vscode/tasks.json', tmpl.replace('__BROWSER_URL__', process.argv[1]));
" "$BROWSER_URL"
echo "[setup] .vscode/tasks.json created (codespace: ${CODESPACE})"
