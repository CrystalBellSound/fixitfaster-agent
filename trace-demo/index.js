/**
 * 로그 데모처럼 주기적으로 트레이스를 Agent(8126)로 전송.
 * Docker Compose 에서 Agent 서비스 이름이 "agent" 이므로 hostname: 'agent'
 */
const tracer = require('dd-trace').init({
  service: 'trace-demo',
  env: process.env.DD_ENV || 'development',
  hostname: 'agent',
  port: 8126,
});

const intervalMs = 15000; // 15초마다 스팬 1개

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

console.log(`[trace-demo] sending trace every ${intervalMs / 1000}s to agent:8126`);
