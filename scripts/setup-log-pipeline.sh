#!/bin/bash
# log-demo pipeline setup
# - Grok Parser: timestamp + level + message
# - Date Remapper: Asia/Seoul timezone for timestamp

set -euo pipefail

# Load keys from .env.local
if [ -f .env.local ]; then
  export $(grep -E '^DATADOG_API_KEY=|^DATADOG_APP_KEY=' .env.local | xargs)
fi

API_KEY="${DATADOG_API_KEY:-}"
APP_KEY="${DATADOG_APP_KEY:-}"
SITE="${DATADOG_SITE:-datadoghq.com}"

if [ -z "$API_KEY" ] || [ -z "$APP_KEY" ]; then
  echo "❌ DATADOG_API_KEY and DATADOG_APP_KEY are required in .env.local"
  echo "   Create an Application Key under Organization Settings → Application Keys."
  exit 1
fi

API_URL="https://api.${SITE}/api/v1/logs/config/pipelines"

echo "🔧 Creating log-demo pipeline..."

# Write pipeline JSON to a temp file for curl -d @
PIPELINE_FILE=$(mktemp)
trap "rm -f $PIPELINE_FILE" EXIT
cat > "$PIPELINE_FILE" <<'ENDOFJSON'
{
  "name": "log-demo (Asia/Seoul Timezone)",
  "is_enabled": true,
  "filter": {
    "query": "service:log-demo"
  },
  "processors": [
    {
      "type": "grok-parser",
      "name": "Parse timestamp, level, and message",
      "is_enabled": true,
      "source": "message",
      "grok": {
        "match_rules": "log_demo %{date(\"yyyy-MM-dd HH:mm:ss\"):timestamp} \\[%{word:level}\\] \\[%{notSpace:logger}\\] %{data:msg}"
      },
      "samples": [
        "2024-01-15 14:30:00 [INFO] [log-demo] User 123 completed action successfully"
      ]
    },
    {
      "type": "date-remapper",
      "name": "Set official timestamp (Asia/Seoul)",
      "is_enabled": true,
      "sources": ["timestamp"],
      "target": "timestamp",
      "timezone": "Asia/Seoul"
    },
    {
      "type": "status-remapper",
      "name": "Set log level",
      "is_enabled": true,
      "sources": ["level"]
    },
    {
      "type": "message-remapper",
      "name": "Set message",
      "is_enabled": true,
      "sources": ["msg"]
    }
  ]
}
ENDOFJSON

# Check for existing pipeline
echo "📋 Checking existing pipelines..."
EXISTING=$(curl -s -X GET "$API_URL" \
  -H "DD-API-KEY: $API_KEY" \
  -H "DD-APPLICATION-KEY: $APP_KEY" \
  -H "Content-Type: application/json")

LOG_DEMO_ID=$(echo "$EXISTING" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for p in data:
    if 'log-demo' in p.get('name', ''):
        print(p['id'])
        break
" 2>/dev/null || true)

if [ -n "$LOG_DEMO_ID" ]; then
  echo "🔄 Updating existing pipeline (ID: $LOG_DEMO_ID)..."
  RESPONSE=$(curl -s -X PUT "${API_URL}/${LOG_DEMO_ID}" \
    -H "DD-API-KEY: $API_KEY" \
    -H "DD-APPLICATION-KEY: $APP_KEY" \
    -H "Content-Type: application/json" \
    -d @"$PIPELINE_FILE")
else
  echo "➕ Creating new pipeline..."
  RESPONSE=$(curl -s -X POST "$API_URL" \
    -H "DD-API-KEY: $API_KEY" \
    -H "DD-APPLICATION-KEY: $APP_KEY" \
    -H "Content-Type: application/json" \
    -d @"$PIPELINE_FILE")
fi

# Check result
if echo "$RESPONSE" | grep -q '"id"'; then
  echo "✅ Pipeline created/updated."
else
  echo "❌ Error:"
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
  if echo "$RESPONSE" | grep -q 'Unauthorized'; then
    echo ""
    echo "💡 If Unauthorized:"
    echo "   1. Application Key: create under Organization Settings → Application Keys"
    echo "   2. Scope: Logs Write or Standard/Admin for pipeline creation"
    echo "   3. .env.local: DATADOG_API_KEY and DATADOG_APP_KEY, no quotes, one per line"
    echo "   4. For EU site add DATADOG_SITE=datadoghq.eu to .env.local"
  fi
  exit 1
fi
