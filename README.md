# Fix It Faster – Agent & Demos

Datadog Agent + demo containers for the Fix It Faster hands-on. Use this repo to run the agent and scenario demos locally.

Leaderboard / challenges: Submit your solutions at the Fix It Faster leaderboard URL (deployed separately): https://tse-fix-faster.vercel.app/

## Quick start

1. Clone the repo:
   ```bash
   git clone https://github.com/CrystalBellSound/fixitfaster-agent.git
   cd fixitfaster-agent
   ```

2. Copy `.env.example` to `.env.local` and set:
   - `DATADOG_API_KEY` (required)
   - `DATADOG_APP_KEY` (required for log pipeline setup)

3. Start the agent and all demos (including log pipeline setup):
   ```bash
   npm run up:full
   ```

## Commands

| Command | Description |
|--------|-------------|
| `npm run up` | Start Agent + all demo containers |
| `npm run down` | Stop and remove all containers |
| `npm run up:full` | Start Agent + all demos + run log pipeline setup |
| `npm run agent:up` | Start only the Agent container |
| `npm run agent:down` | Stop only the Agent container |
| `npm run agent:restart` | Stop and start only the Agent container |
| `npm run logs` | Stream Agent logs (follow) |
| `npm run pipeline:setup` | Create/update log-demo pipeline in Datadog (requires APP key in .env.local) |

## Containers

| Container | Image / Build | Description |
|-----------|---------------|-------------|
| **fixitfaster-agent** | `datadog/agent:7` | Datadog Agent: APM (8126), Logs, DogStatsD (8125), container discovery via docker.sock. Mounts `conf.d/nginx.d/autoconf.yaml` for Autodiscovery. |
| **fixitfaster-trace-demo** | `./trace-demo` | Sends APM spans to the Agent every 5s (APM scenario). |
| **fixitfaster-log-demo** | `./log-demo` | Outputs logs with Asia/Seoul timestamps every 5s (log timezone / pipeline scenario). |
| **fixitfaster-correlation-demo** | `./correlation-demo` | Node.js + dd-trace; Trace–Log correlation scenario (labels: `com.datadoghq.ad.logs`). |
| **fixitfaster-metrics-demo** | `./metrics-demo` | Sends custom DogStatsD metrics to the Agent every 5s (custom metrics scenario). |
| **fixitfaster-ad-demo-nginx** | `nginx:alpine` | Nginx container for Autodiscovery scenario; Agent runs nginx check via mounted `conf.d/nginx.d/autoconf.yaml` (ad_identifiers). Serves `/nginx_status`. |
