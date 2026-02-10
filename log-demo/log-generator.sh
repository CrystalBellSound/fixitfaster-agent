#!/bin/sh
# 로그 타임존 파싱 시나리오용
# - 로그에 Asia/Seoul 타임존 타임스탬프 출력
# - Datadog 파이프라인에서 올바른 타임존 파싱 필요

# TZ 환경변수로 타임존 설정 (기본: Asia/Seoul)
export TZ="${LOG_TIMEZONE:-Asia/Seoul}"

echo "[log-demo] Starting with timezone: $TZ"

while true; do
  # 다양한 로그 레벨과 포맷
  TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
  LEVEL=$(shuf -n1 -e INFO WARN ERROR DEBUG)
  USER_ID=$((RANDOM % 1000))
  
  case $LEVEL in
    INFO)
      echo "$TIMESTAMP [$LEVEL] [log-demo] User $USER_ID completed action successfully"
      ;;
    WARN)
      echo "$TIMESTAMP [$LEVEL] [log-demo] Slow response detected for user $USER_ID (latency: $((RANDOM % 500 + 100))ms)"
      ;;
    ERROR)
      echo "$TIMESTAMP [$LEVEL] [log-demo] Failed to process request for user $USER_ID - timeout"
      ;;
    DEBUG)
      echo "$TIMESTAMP [$LEVEL] [log-demo] Processing checkpoint for user $USER_ID"
      ;;
  esac
  
  sleep 10
done
