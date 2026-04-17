#!/bin/sh
# Web application HTTP access log simulator
# Used for scenario-container-logs-exclusion

ENDPOINTS="/api/users /api/orders /health /api/products /api/auth /api/search"

while true; do
  ENDPOINT=$(echo "$ENDPOINTS" | tr ' ' '\n' | shuf -n1)

  ROLL=$((RANDOM % 10))
  if [ "$ROLL" -lt 7 ]; then
    STATUS=200
  elif [ "$ROLL" -lt 8 ]; then
    STATUS=201
  elif [ "$ROLL" -lt 9 ]; then
    STATUS=404
  elif [ "$ROLL" -lt 10 ]; then
    STATUS=500
  else
    STATUS=400
  fi

  DURATION=$(( RANDOM % 300 + 10 ))
  TIMESTAMP=$(date -u '+%Y-%m-%dT%H:%M:%SZ')

  if [ "$STATUS" -ge 500 ]; then
    LEVEL="ERROR"
  elif [ "$STATUS" -ge 400 ]; then
    LEVEL="WARN"
  else
    LEVEL="INFO"
  fi

  echo "$TIMESTAMP [$LEVEL] [app-demo] GET $ENDPOINT $STATUS ${DURATION}ms"

  sleep 4
done
