# Fix It Faster – Agent & Demos

Datadog Agent + demo containers for the Fix It Faster hands-on. Use this repo (or the `agent/` folder from the main fixitfaster repo) to run the agent and scenario demos locally.

**Leaderboard / challenges:** Submit your solutions at the Fix It Faster leaderboard URL (deployed separately).

## Quick start

1. Copy `.env.example` to `.env.local` and set:
   - `DATADOG_API_KEY` (required)
   - `DATADOG_APP_KEY` (required for log pipeline setup)
2. Start the agent and demos:
   ```bash
   npm run up
   ```
3. (Optional) Create the log-demo pipeline (timezone parsing scenario):
   ```bash
   npm run pipeline:setup
   ```
   Or run everything in one go:
   ```bash
   npm run up:full
   ```

## Commands

| Command | Description |
|--------|-------------|
| `npm run up` | Start Agent + trace-demo, log-demo, correlation-demo, metrics-demo |
| `npm run down` | Stop all containers |
| `npm run logs` | Follow agent logs |
| `npm run pipeline:setup` | Create log-demo pipeline (Grok + Date Remapper) in Datadog |
| `npm run up:full` | `up` then `pipeline:setup` |

## Containers

- **agent** – Datadog Agent 7 (APM, Logs, DogStatsD)
- **trace-demo** – Sends spans to the agent (APM scenario)
- **log-demo** – Logs with Asia/Seoul timestamp (timezone scenario)
- **correlation-demo** – Trace + log correlation
- **metrics-demo** – Custom metrics via DogStatsD

## Standalone repo

This folder can be published as a separate repo (e.g. under a Datadog org) so participants only clone the agent + demos. Challenge content and leaderboard remain in the main fixitfaster repo / deployment.
