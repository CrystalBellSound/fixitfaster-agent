# Fix It Faster

Datadog 트러블슈팅 챌린지와 리더보드 앱입니다. Codespace에서 문제를 해결하고 제출하세요. 동점일 때는 **총 소요 시간**으로 순위가 갈립니다.

---

## 참가자용: 어떻게 플레이하나요?

### 1. 챌린지 풀기

- 챌린지 페이지에서 시나리오를 고르고 타이머를 시작합니다.
- Codespace에서 원인을 찾고 수정합니다.

### 2. 제출

챌린지 페이지에서 **복사** 버튼을 누르면 타이머가 멈추고, 제출 명령이 클립보드에 복사됩니다. Codespace 터미널에 붙여넣기만 하면 아티팩트 전송 + 제출이 한 번에 끝납니다.

### 3. 솔루션 작성 (선택)

제출 후, 같은 챌린지 페이지에서 원인 요약과 해결 방법을 작성하면 AI가 추가 채점합니다 (최대 20점).

---

## 채점·점수 안내

| 시나리오 | 결과 점수 | 만점 (결과 + 솔루션) |
|----------|-----------|----------------------|
| Infra (Hostname) | 50 | 70 |
| Autodiscovery | 60 | 80 |
| APM | 80 | 100 |
| Correlation | 50 | 70 |
| Custom metrics | 80 | 100 |
| Log timezone (보너스) | — | 20 |

- **솔루션(선택):** 원인/해결을 작성하면 AI가 0~20점으로 채점합니다.
- **보너스 (Log timezone):** Datadog UI에서 파이프라인을 수정하는 시나리오입니다. 솔루션 작성만으로 최대 20점.
- **총점:** `결과 + 솔루션` (최대 100점). 동점이면 소요 시간이 짧은 사람이 위.

---

# Fix It Faster (English)

Datadog troubleshooting challenges and leaderboard app. Solve issues in Codespace and submit. Ties are broken by **total time** (faster wins).

---

## For participants: How do I play?

### 1. Solve the challenge

- Pick a scenario on the challenge page and start the timer.
- Find and fix the issue in Codespace.

### 2. Submit

Click **Copy** on the challenge page — the timer stops and the submit command is copied to your clipboard. Paste it in the Codespace terminal to send artifacts and submit in one step.

### 3. Add a solution (optional)

After submitting, write the cause and resolution on the same challenge page. AI grades it for up to 20 extra points.

---

## Scoring

| Scenario | Result score | Max (result + solution) |
|----------|--------------|-------------------------|
| Infra (Hostname) | 50 | 70 |
| Autodiscovery | 60 | 80 |
| APM | 80 | 100 |
| Correlation | 50 | 70 |
| Custom metrics | 80 | 100 |
| Log timezone (Bonus) | — | 20 |

- **Solution (optional):** Write cause and resolution for 0–20 pts (AI-graded).
- **Bonus (Log timezone):** Fixed in the Datadog UI. Solution only — up to 20 pts.
- **Total:** `Result + Solution` (capped at 100). Ties ranked by shorter time.
