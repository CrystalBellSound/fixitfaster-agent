/**
 * Trace-Log Correlation 데모
 * - 트레이스 전송 + 로그에 trace_id/span_id 삽입
 * - DD_LOGS_INJECTION=true 시 자동으로 correlation 됨
 */
const tracer = require('dd-trace').init({
  service: 'correlation-demo',
  env: process.env.DD_ENV || 'development',
  hostname: 'agent',
  port: 8126,
  logInjection: process.env.DD_LOGS_INJECTION !== 'false', // 기본 true
});

const intervalMs = 10000; // 10초마다

function doWork() {
  const span = tracer.startSpan('correlation-demo.process', {
    resource: 'user-request',
    tags: { 'demo': 'correlation' },
  });

  // 로그 출력 - logInjection이 true면 trace_id, span_id가 자동 삽입됨
  const traceId = span.context().toTraceId();
  const spanId = span.context().toSpanId();
  
  // JSON 형식 로그 (Datadog에서 자동 파싱)
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    service: 'correlation-demo',
    message: 'Processing user request',
    dd: {
      trace_id: traceId,
      span_id: spanId,
    },
    custom: {
      user_id: Math.floor(Math.random() * 1000),
      action: 'heartbeat',
    },
  };
  
  console.log(JSON.stringify(logEntry));
  
  // 에러 로그도 가끔 발생
  if (Math.random() < 0.2) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      level: 'error',
      service: 'correlation-demo',
      message: 'Simulated error for demo',
      dd: {
        trace_id: traceId,
        span_id: spanId,
      },
      error: {
        kind: 'SimulatedError',
        message: 'This is a test error',
      },
    };
    console.log(JSON.stringify(errorLog));
  }

  span.finish();
}

doWork();
setInterval(doWork, intervalMs);

console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'info',
  service: 'correlation-demo',
  message: `Started - sending traces+logs every ${intervalMs / 1000}s`,
}));
