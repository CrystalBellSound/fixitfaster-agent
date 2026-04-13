const logsInjectionEnabled = process.env.DD_LOGS_INJECTION !== 'false';

const tracer = require('dd-trace').init({
  service: 'correlation-demo',
  env: process.env.DD_ENV || 'development',
  hostname: 'agent',
  port: 8126,
  logInjection: logsInjectionEnabled,
});

const intervalMs = 5000; // every 5s

function doWork() {
  const span = tracer.startSpan('correlation-demo.process', {
    resource: 'user-request',
    tags: { 'demo': 'correlation' },
  });

  const traceId = span.context().toTraceId();
  const spanId = span.context().toSpanId();

  const correlationFields = logsInjectionEnabled
    ? { trace_id: String(traceId), span_id: String(spanId) }
    : {};

  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    service: 'correlation-demo',
    message: 'Processing user request',
    ...correlationFields,
    custom: {
      user_id: Math.floor(Math.random() * 1000),
      action: 'heartbeat',
    },
  };

  console.log(JSON.stringify(logEntry));

  if (Math.random() < 0.2) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      level: 'error',
      service: 'correlation-demo',
      message: 'Simulated error for demo',
      ...correlationFields,
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
