#!/usr/bin/env python3
"""
log-demo pipeline setup (Python)
- Create pipeline via API (grok match_rules only)
- Reads DATADOG_API_KEY, DATADOG_APP_KEY from .env.local
"""
import os
import sys
import json
import urllib.request
import urllib.error

def load_env():
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
    if not os.path.isfile(env_path):
        print("❌ .env.local not found.")
        sys.exit(1)
    env = {}
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return env

def main():
    env = load_env()
    api_key = env.get("DATADOG_API_KEY") or os.environ.get("DATADOG_API_KEY")
    app_key = env.get("DATADOG_APP_KEY") or os.environ.get("DATADOG_APP_KEY")
    site = env.get("DATADOG_SITE", "datadoghq.com")

    if not api_key or not app_key:
        print("❌ DATADOG_API_KEY and DATADOG_APP_KEY are required in .env.local")
        sys.exit(1)

    api_url = f"https://api.{site}/api/v1/logs/config/pipelines"

    # Python 동작 예시와 동일한 구조: grok 에 match_rules 만
    pipeline = {
        "name": "log-demo (Asia/Seoul Timezone)",
        "is_enabled": True,
        "filter": {"query": "service:log-demo"},
        "processors": [
            {
                "type": "grok-parser",
                "name": "Parse timestamp, level, and message",
                "is_enabled": True,
                "source": "message",
                "grok": {
                    "match_rules": 'log_demo %{date("yyyy-MM-dd HH:mm:ss"):timestamp} \\[%{word:level}\\] \\[%{notSpace:logger}\\] %{data:msg}'
                },
                "samples": [
                    "2024-01-15 14:30:00 [INFO] [log-demo] User 123 completed action successfully"
                ],
            },
            {
                "type": "date-remapper",
                "name": "Set official timestamp (Asia/Seoul)",
                "is_enabled": True,
                "sources": ["timestamp"],
                "target": "timestamp",
                "timezone": "Asia/Seoul",
            },
            {"type": "status-remapper", "is_enabled": True, "sources": ["level"]},
            {"type": "message-remapper", "is_enabled": True, "sources": ["msg"]},
        ],
    }

    # 기존 파이프라인 목록
    req = urllib.request.Request(
        api_url,
        headers={
            "DD-API-KEY": api_key,
            "DD-APPLICATION-KEY": app_key,
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            existing = json.load(resp)
    except urllib.error.HTTPError as e:
        print(f"❌ Failed to list pipelines: {e.code}")
        print(e.read().decode())
        sys.exit(1)

    log_demo_id = None
    for p in existing:
        if "log-demo" in p.get("name", ""):
            log_demo_id = p["id"]
            break

    body = json.dumps(pipeline).encode("utf-8")
    if log_demo_id:
        print(f"🔄 Updating existing pipeline (ID: {log_demo_id})...")
        req = urllib.request.Request(
            f"{api_url}/{log_demo_id}",
            data=body,
            method="PUT",
            headers={
                "DD-API-KEY": api_key,
                "DD-APPLICATION-KEY": app_key,
                "Content-Type": "application/json",
            },
        )
    else:
        print("➕ Creating new pipeline...")
        req = urllib.request.Request(
            api_url,
            data=body,
            method="POST",
            headers={
                "DD-API-KEY": api_key,
                "DD-APPLICATION-KEY": app_key,
                "Content-Type": "application/json",
            },
        )

    try:
        with urllib.request.urlopen(req) as resp:
            result = json.load(resp)
            if result.get("id"):
                print("✅ Pipeline created/updated.")
                return
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        print("❌ Error:")
        try:
            print(json.dumps(json.loads(err_body), indent=2, ensure_ascii=False))
        except Exception:
            print(err_body)
        sys.exit(1)

    print("❌ Response missing id.")
    sys.exit(1)

if __name__ == "__main__":
    main()
