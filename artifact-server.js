const http = require("http");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PORT = process.env.ARTIFACT_SERVER_PORT || 4000;
const REPO_DIR = __dirname;
const DEFAULT_URL = "https://dd-tse-fix-it-faster.vercel.app";
const FIXITFASTER_URL = (
  process.env.FIXITFASTER_URL || DEFAULT_URL
).trim().replace(/\/$/, "");
const CODESPACE_ID = (process.env.CODESPACE_NAME || "").trim();
const PUSH_INTERVAL = 15000;

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

// --- Auto-push ---
let lastPushHash = "";

async function pushArtifacts() {
  if (!CODESPACE_ID) return;

  // Always send heartbeat (even if artifacts unchanged)
  try {
    await fetch(`${FIXITFASTER_URL}/api/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codespaceId: CODESPACE_ID }),
    });
  } catch {}

  try {
    const artifacts = collectArtifacts();
    const hash = require("crypto")
      .createHash("md5")
      .update(artifacts)
      .digest("hex");
    if (hash === lastPushHash) return;

    const res = await fetch(`${FIXITFASTER_URL}/api/artifacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challengeId: "_auto",
        participantName: `_cs:${CODESPACE_ID}`,
        artifacts,
      }),
    });
    if (res.ok) {
      lastPushHash = hash;
      console.log("[artifact-server] pushed (%s)", CODESPACE_ID);
    } else {
      console.warn("[artifact-server] push HTTP %d", res.status);
    }
  } catch (err) {
    console.warn("[artifact-server] push failed:", err.message);
  }
}

// --- Command queue polling ---
const CMD_POLL_INTERVAL = 3000;
const { exec } = require("child_process");

let commandBusy = false;

async function markCommand(cmdId, status, output) {
  try {
    await fetch(`${FIXITFASTER_URL}/api/commands`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codespaceId: CODESPACE_ID, commandId: cmdId, status, output: (output || "").slice(0, 5000) }),
    });
  } catch {}
}

async function pollCommands() {
  if (!CODESPACE_ID || commandBusy) return;
  commandBusy = true;

  try {
    const cmdUrl = `${FIXITFASTER_URL}/api/commands?codespaceId=${encodeURIComponent(CODESPACE_ID)}`;
    const res = await fetch(cmdUrl);
    if (!res.ok) {
      console.warn("[commands] poll failed: HTTP %d", res.status);
      return;
    }
    const { commands } = await res.json();
    if (!commands?.length) return;
    console.log("[commands] found %d pending command(s)", commands.length);

    for (const cmd of commands) {
      await markCommand(cmd.id, "running", "");

      if (cmd.command === "force-push") {
        lastPushHash = "";
        await pushArtifacts();
        await markCommand(cmd.id, "done", "pushed");
        continue;
      }

      if (cmd.command === "setup") {
        const { apiKey, appKey } = cmd.payload || {};
        if (!apiKey) {
          await markCommand(cmd.id, "error", "Missing apiKey in payload");
          continue;
        }
        console.log("\n========================================");
        console.log("[setup] Writing .env.local...");
        const envContent = `DATADOG_API_KEY=${apiKey}\nDATADOG_APP_KEY=${appKey || ""}\n`;
        fs.writeFileSync(path.join(REPO_DIR, ".env.local"), envContent);
        console.log("[setup] Starting Docker containers...");
        console.log("========================================\n");
        try {
          execSync("npm run up", { cwd: REPO_DIR, timeout: 120000, stdio: "inherit" });
          console.log("\n[setup] Running pipeline setup...");
          execSync("npm run pipeline:setup", { cwd: REPO_DIR, timeout: 30000, stdio: "inherit" });
          console.log("\n[setup] Done! Environment is ready.\n");
          await markCommand(cmd.id, "done", "Setup complete");
        } catch (err) {
          console.error("\n[setup] Failed:", err.message);
          await markCommand(cmd.id, "error", err.message);
        }
        continue;
      }

      console.log("[commands] executing: %s (%s)", cmd.command, cmd.shell);
      try {
        const output = execSync(cmd.shell, { cwd: REPO_DIR, timeout: 60000, encoding: "utf-8" });
        console.log("[commands] %s: done (%d chars)", cmd.command, output.length);
        await markCommand(cmd.id, "done", output);
      } catch (err) {
        const output = (err.stdout || "") + "\n" + (err.stderr || "") + "\n" + err.message;
        console.log("[commands] %s: error", cmd.command);
        await markCommand(cmd.id, "error", output);
      }
    }
  } catch (e) { console.warn("[commands] poll error:", e.message || e); } finally {
    commandBusy = false;
  }
}

// --- HTTP server ---
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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

  // POST /setup — browser sends API keys, server creates .env.local + starts docker
  if (req.method === "POST" && url.pathname === "/setup") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const { apiKey, appKey } = JSON.parse(body);
        if (!apiKey) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "apiKey required" }));
        }

        console.log("\n========================================");
        console.log("[setup] Writing .env.local...");
        const envContent = `DATADOG_API_KEY=${apiKey}\nDATADOG_APP_KEY=${appKey || ""}\n`;
        fs.writeFileSync(path.join(REPO_DIR, ".env.local"), envContent);

        console.log("[setup] Starting Docker containers...");
        console.log("========================================\n");
        execSync("npm run up", { cwd: REPO_DIR, timeout: 120000, stdio: "inherit" });

        console.log("\n[setup] Running pipeline setup...");
        execSync("npm run pipeline:setup", { cwd: REPO_DIR, timeout: 30000, stdio: "inherit" });

        console.log("\n[setup] Done! Environment is ready.\n");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        console.error("\n[setup] Failed:", err.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log("[artifact-server] http://localhost:%d/artifacts", PORT);
  if (CODESPACE_ID) {
    // Force port to public (devcontainer.json portsAttributes is unreliable)
    try {
      execSync(`gh codespace ports visibility ${PORT}:public -c ${CODESPACE_ID}`, {
        timeout: 15000, encoding: "utf-8", stdio: "pipe",
      });
      console.log("[artifact-server] Port %d set to public", PORT);
    } catch (e) {
      console.warn("[artifact-server] Failed to set port public:", e.message?.split("\n")[0]);
    }

    console.log(
      "[artifact-server] auto-push every %ds → %s (codespace: %s)",
      PUSH_INTERVAL / 1000,
      FIXITFASTER_URL,
      CODESPACE_ID
    );
    pushArtifacts();
    setInterval(pushArtifacts, PUSH_INTERVAL);
    pollCommands();
    setInterval(pollCommands, CMD_POLL_INTERVAL);
  } else {
    console.log(
      "[artifact-server] Not in Codespace (CODESPACE_NAME not set) — auto-push disabled."
    );
  }
});
