/**
 * DogStatsD 커스텀 메트릭 데모
 * - Agent의 8125 포트로 메트릭 전송
 * - DD_DOGSTATSD_NON_LOCAL_TRAFFIC=true 필요
 */
const StatsD = require('hot-shots');

const client = new StatsD({
  host: 'agent',
  port: 8125,
  prefix: 'fixitfaster.',
  globalTags: {
    env: process.env.DD_ENV || 'development',
    service: 'metrics-demo',
  },
  errorHandler: (err) => {
    console.error('[metrics-demo] StatsD error:', err.message);
  },
});

const intervalMs = 10000; // 10초마다

function sendMetrics() {
  // Gauge: 현재 값 (예: 메모리 사용량)
  const memUsage = Math.floor(Math.random() * 100);
  client.gauge('demo.memory_usage', memUsage, { unit: 'percent' });

  // Counter: 누적 카운트
  client.increment('demo.requests_total', 1, { endpoint: '/api/health' });

  // Histogram: 분포 측정 (예: 응답 시간)
  const responseTime = Math.floor(Math.random() * 500) + 50;
  client.histogram('demo.response_time', responseTime, { unit: 'ms' });

  // Set: 고유 값 카운트 (예: 유니크 유저)
  const userId = `user_${Math.floor(Math.random() * 50)}`;
  client.set('demo.unique_users', userId);

  console.log(`[metrics-demo] sent metrics: memory=${memUsage}%, response_time=${responseTime}ms`);
}

// 시작 시 즉시 1회 전송
sendMetrics();
setInterval(sendMetrics, intervalMs);

console.log(`[metrics-demo] sending custom metrics every ${intervalMs / 1000}s to agent:8125`);

// 종료 시 클라이언트 정리
process.on('SIGTERM', () => {
  client.close();
  process.exit(0);
});
