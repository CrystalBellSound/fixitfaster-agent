const http = require("http");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = process.env.ARTIFACT_SERVER_PORT || 4000;
const REPO_DIR = __dirname;
const FIXITFASTER_URL = (
  process.env.FIXITFASTER_URL || ""
).trim().replace(/\/$/, "");
const PUSH_INTERVAL = 15000; // 15 seconds

function getParticipantName() {
  const env = (process.env.PARTICIPANT_NAME || "").trim();
  if (env) return env;
  try {
    return fs
      .readFileSync(path.join(os.homedir(), ".fixitfaster-participant"), "utf-8")
      .split("\n")[0]
      .trim();
  } catch {
    return null;
  }
}

function collectArtifacts() {
  const parts = [];

  try {
    parts.push("=== git status ===");
    parts.push(
      execSync("git status --short", { cwd: REPO_DIR, encoding: "utf-8" })
    );
  } catch {}

  try {
    parts.push("=== git diff (excluding .env.local, staged + unstaged) ===");
    parts.push(
      execSync('git diff HEAD -- . ":(exclude).env.local"', {
        cwd: REPO_DIR,
        encoding: "utf-8",
      })
    );
  } catch {}

  const composePath = path.join(REPO_DIR, "docker-compose.yml");
  if (fs.existsSync(composePath)) {
    parts.push("=== docker-compose.yml ===");
    parts.push(fs.readFileSync(composePath, "utf-8"));
  }

  const confDir = path.join(REPO_DIR, "conf.d");
  if (fs.existsSync(confDir)) {
    parts.push("=== conf.d/ ===");
    (function scanDir(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(full);
        } else if (/\.ya?ml$/.test(entry.name)) {
          parts.push(`--- ${path.relative(REPO_DIR, full)} ---`);
          parts.push(fs.readFileSync(full, "utf-8"));
        }
      }
    })(confDir);
  }

  return parts.join("\n");
}

// --- Auto-push to Vercel ---
let lastPushHash = "";

async function pushArtifacts() {
  const name = getParticipantName();
  if (!FIXITFASTER_URL || !name) return;

  try {
    const artifacts = collectArtifacts();
    const hash = require("crypto")
      .createHash("md5")
      .update(artifacts)
      .digest("hex");
    if (hash === lastPushHash) return; // skip if unchanged

    const res = await fetch(`${FIXITFASTER_URL}/api/artifacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challengeId: "_auto",
        participantName: name,
        artifacts,
      }),
    });
    if (res.ok) {
      lastPushHash = hash;
      console.log("[artifact-server] pushed artifacts for %s", name);
    } else {
      console.warn("[artifact-server] push failed: HTTP %d", res.status);
    }
  } catch (err) {
    console.warn("[artifact-server] push failed:", err.message);
  }
}

// --- HTTP server (backward compat) ---
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true }));
  }

  if (req.method === "GET" && url.pathname === "/artifacts") {
    try {
      const artifacts = collectArtifacts();
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ artifacts }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log("[artifact-server] http://localhost:%d/artifacts", PORT);
  if (FIXITFASTER_URL) {
    const name = getParticipantName();
    console.log(
      "[artifact-server] auto-push every %ds → %s (name: %s)",
      PUSH_INTERVAL / 1000,
      FIXITFASTER_URL,
      name || "NOT SET"
    );
    pushArtifacts();
    setInterval(pushArtifacts, PUSH_INTERVAL);
  } else {
    console.log(
      "[artifact-server] FIXITFASTER_URL not set — auto-push disabled. Set it in .env.local."
    );
  }
});
