#!/bin/sh
# Infrastructure service log simulator
# Used for scenario-missing-container-metrics-logs-exclusion

SERVICES="auth-service payment-service inventory-service notification-service"
LEVELS="INFO INFO INFO WARN ERROR"

while true; do
  SERVICE=$(echo "$SERVICES" | tr ' ' '\n' | shuf -n1)
  LEVEL=$(echo "$LEVELS" | tr ' ' '\n' | shuf -n1)
  TIMESTAMP=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
  LATENCY=$(( RANDOM % 150 + 10 ))

  case $LEVEL in
    INFO)
      echo "$TIMESTAMP [$LEVEL] [infra-demo] $SERVICE healthy latency=${LATENCY}ms"
      ;;
    WARN)
      echo "$TIMESTAMP [$LEVEL] [infra-demo] $SERVICE slow response latency=${LATENCY}ms threshold=100ms"
      ;;
    ERROR)
      echo "$TIMESTAMP [$LEVEL] [infra-demo] $SERVICE connection timeout after ${LATENCY}ms"
      ;;
  esac

  sleep 4
done
