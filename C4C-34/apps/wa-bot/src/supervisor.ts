/**
 * 24/7 supervisor for the BolKeBecho WhatsApp bot.
 *
 * This is the ONLY process restarter. We do NOT use ts-node-dev's --respawn
 * because that fights with the supervisor and leaves zombie Chrome processes.
 *
 * Boot sequence each time the child starts:
 *   1. Kill orphan Chrome/chromium processes (puppeteer leftovers from prior crashes)
 *   2. Spawn the bot child via plain ts-node
 *   3. Active health probe every HEALTH_INTERVAL_MS to /health endpoint
 *   4. If health probe fails N times in a row, kill the child and restart with backoff
 *   5. If child exits non-zero, restart with backoff
 *   6. Crash-loop detection: if N crashes in WINDOW_MS, give up
 *
 * This is the "no zombie ever survives" supervisor.
 */
import { spawn, ChildProcess, exec } from "child_process";
import path from "path";
import os from "os";

interface SupervisorOptions {
  command: string;
  args: string[];
  cwd: string;
  /** Backoff schedule in ms. Each crash advances one step until the cap. */
  backoff: number[];
  /** If we crash N times within crashWindowMs, give up. */
  crashLoopThreshold: number;
  crashWindowMs: number;
  /** Health probe URL. */
  healthUrl: string;
  /** How often to probe. */
  healthIntervalMs: number;
  /** How long to wait for the bot to come up before starting health probes. */
  healthGraceMs: number;
  /** How many consecutive failures before we restart the child. */
  healthFailureThreshold: number;
}

const isWindows = process.platform === "win32";

const defaultOptions: SupervisorOptions = {
  // Use node directly with ts-node/register — no npx shell wrapper.
  // This makes process kill more reliable (no orphan shell).
  command: "node",
  args: ["-r", "ts-node/register/transpile-only", "src/index.ts"],
  cwd: path.resolve(__dirname, ".."),
  backoff: [2_000, 5_000, 10_000, 30_000, 60_000, 120_000],
  crashLoopThreshold: 5,
  crashWindowMs: 60_000,
  healthUrl: `http://localhost:${process.env.PORT || 5001}/health`,
  healthIntervalMs: 30_000,
  healthGraceMs: 90_000, // give the bot 90s to log in before probing
  healthFailureThreshold: 3,
};

function ts(): string {
  return new Date().toISOString();
}

function logSup(event: string, data?: Record<string, unknown>): void {
  const tail = data ? " " + JSON.stringify(data) : "";
  console.log(`🛡️  [${ts()}] SUPERVISOR_${event}${tail}`);
}

// ---------------------------------------------------------------------------
// Orphan Chrome / puppeteer cleanup
// ---------------------------------------------------------------------------

/**
 * Kill stray Chrome/chromium processes that puppeteer left behind.
 *
 * Strategy: target processes whose command line contains either:
 *   - our .wwebjs_auth folder path (most specific)
 *   - --remote-debugging-port (puppeteer's signature flag)
 *   - --user-data-dir pointing to anywhere under our cwd
 *
 * We use multiple strategies because Windows tools vary in availability
 * (wmic is deprecated, taskkill alone is too coarse).
 */
async function cleanupOrphans(cwd: string): Promise<void> {
  const sessionDirRaw = path.join(cwd, ".wwebjs_auth");
  // Escape backslashes for command-line use
  const sessionDir = sessionDirRaw.replace(/\\/g, "\\\\");
  // For pkill / pgrep on POSIX
  const sessionDirPosix = sessionDirRaw;

  if (isWindows) {
    // Strategy 1: PowerShell — modern, reliable, handles long paths
    const psScript = `Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -like '*${sessionDir}*' -or $_.CommandLine -like '*--remote-debugging-port*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`;

    await new Promise<void>((resolve) => {
      exec(
        `powershell -NoProfile -Command "${psScript.replace(/"/g, '\\"')}"`,
        { timeout: 15_000 },
        () => resolve(),
      );
    });
  } else {
    // POSIX: pkill on command line match
    await new Promise<void>((resolve) => {
      exec(`pkill -f "${sessionDirPosix}"`, { timeout: 10_000 }, () => {
        // Also kill any puppeteer chrome with --remote-debugging-port
        exec(`pkill -f "remote-debugging-port"`, { timeout: 10_000 }, () => resolve());
      });
    });
  }

  // Brief pause so the OS reclaims handles + lockfile
  await new Promise((r) => setTimeout(r, 2000));

  // Remove stale lockfile if Chrome left one behind. Without this, the next
  // Chrome startup will see "another instance is already running" and refuse
  // to load the WhatsApp page.
  try {
    const fs = await import("fs");
    const lockfile = path.join(sessionDirRaw, `session-${process.env.SESSION_ID || "HASTKALA_DEMO"}`, "lockfile");
    if (fs.existsSync(lockfile)) {
      fs.unlinkSync(lockfile);
      logSup("CLEANUP_REMOVED_LOCKFILE", { lockfile });
    }
    // Also remove SingletonLock / SingletonCookie / SingletonSocket
    for (const name of ["SingletonLock", "SingletonCookie", "SingletonSocket"]) {
      const p = path.join(sessionDirRaw, `session-${process.env.SESSION_ID || "HASTKALA_DEMO"}`, name);
      if (fs.existsSync(p)) {
        try {
          fs.unlinkSync(p);
        } catch {
          // ignore
        }
      }
    }
  } catch (err) {
    logSup("CLEANUP_LOCKFILE_FAILED_NONFATAL", { message: (err as Error).message });
  }
}

// ---------------------------------------------------------------------------
// Health probe
// ---------------------------------------------------------------------------

interface HealthState {
  consecutiveFailures: number;
  timer: NodeJS.Timeout | null;
  graceTimer: NodeJS.Timeout | null;
}

async function probeHealth(url: string): Promise<{ ok: boolean; reason?: string }> {
  try {
    // Node 18+ has global fetch
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return { ok: false, reason: `HTTP ${response.status}` };

    const data: any = await response.json().catch(() => null);
    // The bot's /health returns { success: true, data: { whatsappReady: bool, ... } }
    if (data?.data?.whatsappReady === false) {
      return { ok: false, reason: "whatsappReady=false" };
    }
    return { ok: true };
  } catch (error: any) {
    return { ok: false, reason: error?.message || "fetch failed" };
  }
}

function startHealthLoop(opts: SupervisorOptions, killChild: () => void): HealthState {
  const state: HealthState = {
    consecutiveFailures: 0,
    timer: null,
    graceTimer: null,
  };

  // Wait for grace period before probing
  state.graceTimer = setTimeout(() => {
    state.graceTimer = null;
    state.timer = setInterval(async () => {
      const result = await probeHealth(opts.healthUrl);
      if (result.ok) {
        if (state.consecutiveFailures > 0) {
          logSup("HEALTH_RECOVERED", { afterFailures: state.consecutiveFailures });
        }
        state.consecutiveFailures = 0;
      } else {
        state.consecutiveFailures += 1;
        logSup("HEALTH_FAILED", {
          consecutive: state.consecutiveFailures,
          threshold: opts.healthFailureThreshold,
          reason: result.reason,
        });
        if (state.consecutiveFailures >= opts.healthFailureThreshold) {
          logSup("HEALTH_TRIGGERING_RESTART", {
            failures: state.consecutiveFailures,
            hint: "Bot is unhealthy. Killing child to force restart.",
          });
          killChild();
          state.consecutiveFailures = 0;
        }
      }
    }, opts.healthIntervalMs);

    if (typeof state.timer.unref === "function") state.timer.unref();
  }, opts.healthGraceMs);

  return state;
}

function stopHealthLoop(state: HealthState): void {
  if (state.graceTimer) {
    clearTimeout(state.graceTimer);
    state.graceTimer = null;
  }
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
  state.consecutiveFailures = 0;
}

// ---------------------------------------------------------------------------
// Main supervisor loop
// ---------------------------------------------------------------------------

async function run(opts: SupervisorOptions): Promise<void> {
  const recentCrashes: number[] = [];
  let backoffIndex = 0;
  let child: ChildProcess | null = null;
  let shuttingDown = false;
  let healthState: HealthState | null = null;

  const shutdown = (signal: string) => {
    shuttingDown = true;
    logSup("SHUTDOWN_SIGNAL", { signal });
    if (healthState) stopHealthLoop(healthState);
    if (child && !child.killed) {
      try {
        child.kill(signal as NodeJS.Signals);
      } catch {
        // ignore
      }
    }
    setTimeout(() => process.exit(0), 2_000);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  const killChild = () => {
    if (child && !child.killed) {
      try {
        if (isWindows) {
          // Windows: kill the whole tree including puppeteer/Chrome
          exec(`taskkill /F /T /PID ${child.pid}`, () => undefined);
        } else {
          child.kill("SIGKILL");
        }
      } catch (err) {
        logSup("KILL_CHILD_FAILED", { message: (err as Error).message });
      }
    }
  };

  while (!shuttingDown) {
    // Crash-loop detection
    const now = Date.now();
    while (recentCrashes.length && recentCrashes[0] < now - opts.crashWindowMs) {
      recentCrashes.shift();
    }
    if (recentCrashes.length >= opts.crashLoopThreshold) {
      logSup("CRASH_LOOP_DETECTED", {
        crashesInWindow: recentCrashes.length,
        windowMs: opts.crashWindowMs,
        hint: "Giving up. Investigate the bot logs above. Common causes: WhatsApp logout (delete .wwebjs_auth/), missing env vars, OpenAI quota exceeded.",
      });
      process.exit(1);
    }

    // 1. Pre-flight: kill orphans
    logSup("CLEANUP_ORPHAN_CHROME", {});
    try {
      await cleanupOrphans(opts.cwd);
    } catch (err) {
      logSup("CLEANUP_FAILED_NONFATAL", { message: (err as Error).message });
    }

    // 2. Spawn child
    logSup("STARTING_CHILD", {
      command: opts.command,
      args: opts.args,
      cwd: opts.cwd,
      attempt: backoffIndex + 1,
    });
    child = spawn(opts.command, opts.args, {
      cwd: opts.cwd,
      stdio: "inherit",
      env: process.env,
    });

    // 3. Start health probe loop
    healthState = startHealthLoop(opts, killChild);

    // 4. Wait for child exit
    const code: number = await new Promise((resolve) => {
      child!.once("exit", (c) => resolve(c ?? 0));
      child!.once("error", (err) => {
        logSup("CHILD_SPAWN_ERROR", { message: err.message });
        resolve(255);
      });
    });

    // 5. Stop health probe (we're between children)
    if (healthState) stopHealthLoop(healthState);

    if (shuttingDown) break;

    if (code === 0) {
      logSup("CHILD_EXITED_CLEANLY", { code });
      break;
    }

    recentCrashes.push(Date.now());
    const wait = opts.backoff[Math.min(backoffIndex, opts.backoff.length - 1)];
    backoffIndex += 1;

    logSup("CHILD_CRASHED", {
      code,
      attempt: backoffIndex,
      restartInMs: wait,
      crashesInLastMinute: recentCrashes.length,
    });

    await new Promise((r) => setTimeout(r, wait));
  }

  logSup("SUPERVISOR_EXIT", { reason: shuttingDown ? "signal" : "child-clean-exit" });
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

logSup("BOOT", {
  pid: process.pid,
  platform: process.platform,
  arch: process.arch,
  node: process.version,
  hostname: os.hostname(),
  cwd: defaultOptions.cwd,
  healthUrl: defaultOptions.healthUrl,
});

run(defaultOptions).catch((err) => {
  console.error("Supervisor crashed:", err?.message || err);
  process.exit(1);
});
