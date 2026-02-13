#!/usr/bin/env bash
# postCreateCommand에서 호출. 워크스페이스 루트에서 .vscode/tasks.json 생성.
# 폴더 열 때 Simple Browser가 Vercel URL로 자동 열리게 함.
set -e
mkdir -p .vscode
cp .devcontainer/tasks.json.template .vscode/tasks.json
echo "[devcontainer] Created .vscode/tasks.json (Simple Browser will open on folder open)."
