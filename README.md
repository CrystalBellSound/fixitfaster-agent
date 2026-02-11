# Fix It Faster – Agent & Demos

Datadog Agent + demo containers for the Fix It Faster hands-on. Use this repo to run the agent and scenario demos locally.

Leaderboard / challenges: Submit your solutions at the Fix It Faster leaderboard URL (deployed separately): https://tse-fix-faster.vercel.app/


## Quick start

1. Clone the repo
   git clone https://github.com/CrystalBellSound/fixitfaster-agent.git

2  Copy `.env.example` to `.env.local` and set:
   - `DATADOG_API_KEY` (required)
   - `DATADOG_APP_KEY` (required for log pipeline setup)
3. Start the agent and demos:
   ```bash
   npm run up:full
   ```
4. Start the agent and stop:
   ```bash
   npm run agent:up
   npm run agent:down
   ```
## Commands

| Command | Description |
|--------|-------------|
| `npm run up:fill` | Start Agent + trace-demo, log-demo, correlation-demo, metrics-demo, log pipeline |

## Containers

- **agent** – Datadog Agent 7 (APM, Logs, DogStatsD)
- **trace-demo** – Sends spans to the agent (APM scenario)
- **log-demo** – Logs with Asia/Seoul timestamp (timezone scenario)
- **correlation-demo** – Trace + log correlation
- **metrics-demo** – Custom metrics via DogStatsD

