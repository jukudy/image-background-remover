import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const cwd = process.cwd();
const devVarsPath = path.join(cwd, ".dev.vars");
const envLocalPath = path.join(cwd, ".env.local");
const localWranglerConfigHome = path.join(cwd, ".wrangler-config");
mkdirSync(localWranglerConfigHome, { recursive: true });

function readKeyValues(filePath) {
  if (!existsSync(filePath)) return {};
  return Object.fromEntries(
    readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

const devVars = readKeyValues(devVarsPath);
const envLocal = readKeyValues(envLocalPath);
const redirectUri = devVars.GOOGLE_OAUTH_REDIRECT_URI || envLocal.GOOGLE_OAUTH_REDIRECT_URI || "";

console.log(`.dev.vars present: ${existsSync(devVarsPath) ? "yes" : "no"}`);
console.log(`GOOGLE_CLIENT_ID present: ${devVars.GOOGLE_CLIENT_ID ? "yes" : envLocal.GOOGLE_CLIENT_ID ? "from .env.local" : "no"}`);
console.log(`GOOGLE_CLIENT_SECRET present: ${devVars.GOOGLE_CLIENT_SECRET ? "yes" : envLocal.GOOGLE_CLIENT_SECRET ? "from .env.local" : "no"}`);
console.log(`GOOGLE_OAUTH_REDIRECT_URI: ${redirectUri || "(missing)"}`);

if (redirectUri && !redirectUri.startsWith("http://localhost:3000/api/auth/google/callback")) {
  console.log("Local callback mismatch: expected http://localhost:3000/api/auth/google/callback");
}

const env = {
  ...process.env,
  XDG_CONFIG_HOME: localWranglerConfigHome,
  WRANGLER_HOME: localWranglerConfigHome,
};
const command = `"${path.join(cwd, "node_modules", ".bin", "wrangler.cmd")}" d1 execute clearcut-auth --local --command "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users','oauth_accounts','sessions','oauth_states') ORDER BY name;"`;
const result = process.platform === "win32"
  ? spawnSync(command, [], { cwd, encoding: "utf8", env, shell: true })
  : spawnSync(
      path.join(cwd, "node_modules", ".bin", "wrangler"),
      [
        "d1",
        "execute",
        "clearcut-auth",
        "--local",
        "--command",
        "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users','oauth_accounts','sessions','oauth_states') ORDER BY name;",
      ],
      { cwd, encoding: "utf8", env }
    );

console.log("Local D1 table check:");
process.stdout.write(result.stdout || "");
process.stderr.write(result.stderr || "");

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

try {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "grant_type=authorization_code&code=test",
  });
  console.log(`Google token endpoint reachable: yes (status ${response.status})`);
} catch (error) {
  const detail = error && typeof error === "object" && "cause" in error
    ? error.cause
    : null;
  console.log("Google token endpoint reachable: no");
  console.log(
    `Network detail: ${detail && typeof detail === "object" && "message" in detail ? detail.message : error instanceof Error ? error.message : String(error)}`
  );
}
