# Fix It Faster – 랩 설정 가이드

Datadog Agent + 데모 컨테이너로 **Fix It Faster** 챌린지를 진행하는 환경입니다.  
제출·리더보드는 [Fix It Faster 앱](https://dd-tse-fix-it-faster.vercel.app)에서 합니다.

---

## Codespace에서 할 일

### 1. 최초 1회

API Key, App Key, 제출할 이름을 넣고 랩 실행. 아래 한 줄 실행 (**YOUR_KEY·내이름만 바꿔서**):

```bash
echo 'DATADOG_API_KEY=YOUR_KEY' > .env.local && echo 'DATADOG_APP_KEY=YOUR_KEY' >> .env.local && echo '내이름' > ~/.fixitfaster-participant && npm run up:full
```

### 2. 제출 전

Codespace 터미널에서 아래 명령 실행. 이름은 최초 1회에 저장한 값을 씁니다. 이어서 [Vercel 앱](https://dd-tse-fix-it-faster.vercel.app)에서 같은 이름으로 제출.

```bash
curl -sL "https://raw.githubusercontent.com/victorjmlee/fixitfaster/main/lab-server/scripts/collect-and-send-artifacts.sh" -o /tmp/send-artifacts.sh && FIXITFASTER_URL="https://dd-tse-fix-it-faster.vercel.app" CHALLENGE_ID="scenario-apm" bash /tmp/send-artifacts.sh
```

`CHALLENGE_ID`만 현재 챌린지에 맞게 바꿔서 실행 (예: scenario-infra, scenario-apm, scenario-log-timezone 등).

---

## 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run up` | Agent + 모든 데모 컨테이너 시작 (필요 시 빌드) |
| `npm run down` | 모든 컨테이너 중지 및 제거 |
| `npm run agent:restart` | Agent 컨테이너만 재시작 |
| `npm run up:full` | 시작 + Datadog 로그 파이프라인 설정 실행 |

---

## 컨테이너

| 컨테이너 | 이미지/빌드 | 설명 |
|----------|-------------|------|
| fixitfaster-agent | datadog/agent:7 | Agent: APM(8126), Logs, DogStatsD(8125), Autodiscovery |
| fixitfaster-trace-demo | ./trace-demo | APM 시나리오 |
| fixitfaster-log-demo | ./log-demo | 로그 타임존/파이프라인 시나리오 |
| fixitfaster-correlation-demo | ./correlation-demo | Trace–Log correlation |
| fixitfaster-metrics-demo | ./metrics-demo | 커스텀 메트릭 시나리오 |
| fixitfaster-ad-demo-nginx | nginx:alpine | Autodiscovery용 Nginx |

---

→ [챌린지·리더보드 열기](https://dd-tse-fix-it-faster.vercel.app)
