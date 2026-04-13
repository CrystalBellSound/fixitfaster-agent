const tracer = require('dd-trace').init({
  service: 'trace-demo',
  env: process.env.DD_ENV || 'development',
  hostname: 'agent',
  port: 8326,
});

const intervalMs = 5000; // every 5s

function sendSpan() {
  const span = tracer.startSpan('trace-demo.heartbeat', {
    resource: 'heartbeat',
    tags: { 'trace-demo': 'fixitfaster' },
  });
  span.finish();
  console.log(`[trace-demo] span sent at ${new Date().toISOString()}`);
}

sendSpan();
setInterval(sendSpan, intervalMs);

console.log(`[trace-demo] sending trace every ${intervalMs / 1000}s`);
