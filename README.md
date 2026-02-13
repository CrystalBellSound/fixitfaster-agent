# Fix It Faster

Datadog 트러블슈팅 챌린지와 리더보드 앱입니다. 참가자는 랩 환경에서 문제를 해결한 뒤 **결과(artifact)** 를 제출하고, **선택적으로 원인/해결 요약**을 작성해 점수를 받습니다. 동점일 때는 **총 소요 시간**으로 순위가 갈립니다.

---

## 참가자용: 어떻게 플레이하나요?

### 1. 랩 환경에서 챌린지 풀기

- **GitHub Codespaces** 또는 별도 랩(EC2 등)에서 `fixitfaster-agent` 리포를 사용합니다.
- 챌린지 페이지(예: Vercel에 배포된 URL)에서 시나리오를 고르고 타이머를 시작한 뒤, 랩에서 원인을 찾고 수정합니다.
- 랩 설정·상세 절차는 랩 문서를 참고하세요.

### 2. 제출 전에: 결과(artifact) 전송

채점은 **Codespace/랩에서 보낸 결과만** 사용합니다. 제출 **전에** 터미널에서 아래처럼 한 번 실행하세요.

```bash
curl -sL "https://raw.githubusercontent.com/victorjmlee/fixitfaster/main/lab-server/scripts/collect-and-send-artifacts.sh" -o /tmp/send-artifacts.sh
FIXITFASTER_URL="https://여기에-배포된-앱-URL" CHALLENGE_ID="scenario-apm" bash /tmp/send-artifacts.sh
```

- `FIXITFASTER_URL`: 이 앱이 배포된 URL (예: `https://dd-tse-fix-it-faster.vercel.app`)
- `CHALLENGE_ID`: 지금 풀고 있는 챌린지 ID (예: `scenario-infra`, `scenario-apm`)
- 참가자 이름은 최초 설정 시 `~/.fixitfaster-participant`에 저장해 두면 스크립트가 자동으로 사용합니다.

**중요:** 제출할 때 쓰는 **이름**이 artifact 전송 시 사용한 이름과 **완전히 같아야** 채점됩니다.

### 3. 웹에서 제출

- 챌린지 페이지에서 **같은 이름**을 선택/입력한 뒤 제출합니다.
- **선택:** 「원인 요약」「해결 방법」을 작성하면 **솔루션 20점 만점**(AI 채점)을 받을 수 있습니다. 비우면 결과(artifact)만으로 채점됩니다.

---

## 채점·점수 안내

- **결과(artifact) 점수**  
  시나리오마다 다릅니다. 결과만 제출해도 아래 점수까지 받을 수 있습니다.

  | 시나리오 | 결과 점수 | 만점 (결과 + 솔루션 20점) |
  |----------|-----------|----------------------------|
  | Infra (Hostname) | 50 | 70 |
  | Autodiscovery | 60 | 80 |
  | APM | 80 | 100 |
  | Correlation | 50 | 70 |
  | Custom metrics | 80 | 100 |
  | Log timezone | 70 | 90 |

- **솔루션(선택)**  
  원인/해결을 작성하면 AI가 0~20점으로 채점합니다. 비우면 0점입니다.

- **총점**  
  `결과 점수 + 솔루션 점수` (최대 100점). 동점이면 **총 소요 시간이 짧은 사람**이 위로 올라갑니다.

각 챌린지 페이지 상단에 해당 시나리오의 「결과 ○점 + 솔루션 20점 = 만점 ○점」 안내가 표시됩니다.

---

# Fix It Faster (English)

Datadog troubleshooting challenges and leaderboard app. You solve issues in a lab environment, submit **results (artifacts)**, and optionally write a **cause/resolution summary** for extra points. Ties are broken by **total time** (faster wins).

---

## For participants: How do I play?

### 1. Solve the challenge in the lab

- Use the **fixitfaster-agent** repo in **GitHub Codespaces** or your own lab (e.g. EC2).
- On the challenge page (e.g. the Vercel URL), pick a scenario, start the timer, then find and fix the issue in the lab.
- See lab docs for setup and steps.

### 2. Before submitting: Send your results (artifacts)

Grading uses **only** the results sent from your Codespace/lab. **Before** you submit, run this once in the terminal:

```bash
curl -sL "https://raw.githubusercontent.com/victorjmlee/fixitfaster/main/lab-server/scripts/collect-and-send-artifacts.sh" -o /tmp/send-artifacts.sh
FIXITFASTER_URL="https://your-deployed-app-url" CHALLENGE_ID="scenario-apm" bash /tmp/send-artifacts.sh
```

- `FIXITFASTER_URL`: The URL where this app is deployed (e.g. `https://dd-tse-fix-it-faster.vercel.app`)
- `CHALLENGE_ID`: The challenge you’re on (e.g. `scenario-infra`, `scenario-apm`)
- Your participant name is read from `~/.fixitfaster-participant` if you set it during initial setup.

**Important:** The **name** you use when submitting must **exactly match** the name used when sending artifacts.

### 3. Submit on the web

- On the challenge page, enter or select the **same name** and submit.
- **Optional:** If you fill in "Cause summary" and "Resolution", you can earn up to **20 solution points** (AI-graded). Leave them blank to be graded on results only.

---

## Scoring

- **Result (artifact) score**  
  Depends on the scenario. Submitting only results can earn up to:

  | Scenario | Result score | Max (result + 20 solution) |
  |----------|--------------|----------------------------|
  | Infra (Hostname) | 50 | 70 |
  | Autodiscovery | 60 | 80 |
  | APM | 80 | 100 |
  | Correlation | 50 | 70 |
  | Custom metrics | 80 | 100 |
  | Log timezone | 70 | 90 |

- **Solution (optional)**  
  If you write cause and resolution, AI scores them 0–20. Empty = 0.

- **Total**  
  `Result score + Solution score` (capped at 100). Ties are ranked by **shorter total time**.

Each challenge page shows that scenario's "Result ○ pts + Solution 20 pts = ○ max" at the top.
