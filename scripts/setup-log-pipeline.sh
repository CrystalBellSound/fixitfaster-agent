#!/bin/bash
# log-demo 파이프라인 생성 스크립트
# - Grok Parser: 타임스탬프 + 레벨 + 메시지 파싱
# - Date Remapper: Asia/Seoul 타임존으로 timestamp 리매핑

set -euo pipefail

# .env.local에서 키 읽기
if [ -f .env.local ]; then
  export $(grep -E '^DATADOG_API_KEY=|^DATADOG_APP_KEY=' .env.local | xargs)
fi

API_KEY="${DATADOG_API_KEY:-}"
APP_KEY="${DATADOG_APP_KEY:-}"
SITE="${DATADOG_SITE:-datadoghq.com}"

if [ -z "$API_KEY" ] || [ -z "$APP_KEY" ]; then
  echo "❌ DATADOG_API_KEY 와 DATADOG_APP_KEY 가 .env.local 에 필요합니다."
  echo "   APP_KEY는 Organization Settings → Application Keys 에서 생성하세요."
  exit 1
fi

API_URL="https://api.${SITE}/api/v1/logs/config/pipelines"

echo "🔧 log-demo 파이프라인 생성 중..."

# 파이프라인 JSON (Python 예시와 동일 구조: grok에 match_rules만, rule_name + pattern)
# JSON을 파일로 써서 curl -d @ 사용 → 셸 이스케이프 문제 방지
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

# 기존 파이프라인 확인
echo "📋 기존 파이프라인 확인..."
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
  echo "🔄 기존 파이프라인 업데이트 (ID: $LOG_DEMO_ID)..."
  RESPONSE=$(curl -s -X PUT "${API_URL}/${LOG_DEMO_ID}" \
    -H "DD-API-KEY: $API_KEY" \
    -H "DD-APPLICATION-KEY: $APP_KEY" \
    -H "Content-Type: application/json" \
    -d @"$PIPELINE_FILE")
else
  echo "➕ 새 파이프라인 생성..."
  RESPONSE=$(curl -s -X POST "$API_URL" \
    -H "DD-API-KEY: $API_KEY" \
    -H "DD-APPLICATION-KEY: $APP_KEY" \
    -H "Content-Type: application/json" \
    -d @"$PIPELINE_FILE")
fi

# 결과 확인
if echo "$RESPONSE" | grep -q '"id"'; then
  echo "✅ 파이프라인 생성/업데이트 완료!"
  echo ""
  echo "📍 Datadog에서 확인:"
  echo "   Logs → Configuration → Pipelines → 'log-demo (Asia/Seoul Timezone)'"
  echo ""
  echo "💡 Date Remapper timezone이 API로 반영되지 않았다면 Datadog UI에서:"
  echo "   파이프라인 → Date Remapper → 'Define a custom timezone' → Asia/Seoul 선택 후 저장"
else
  echo "❌ 오류 발생:"
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
  if echo "$RESPONSE" | grep -q 'Unauthorized'; then
    echo ""
    echo "💡 Unauthorized 시 확인할 것:"
    echo "   1. Application Key: Organization Settings → Application Keys 에서 새 키 생성"
    echo "   2. 권한(Scope): 파이프라인 생성에는 로그 설정 쓰기 권한 필요 (예: Logs Write 또는 Standard/Admin)"
    echo "   3. .env.local: DATADOG_API_KEY(API Key), DATADOG_APP_KEY(Application Key) 값이 맞는지, 따옴표 없이 한 줄로"
    echo "   4. EU 사이트면 .env.local에 DATADOG_SITE=datadoghq.eu 추가"
  fi
  exit 1
fi
