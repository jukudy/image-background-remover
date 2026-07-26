import { mkdirSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const [, , binName, ...args] = process.argv;

if (!binName) {
  console.error("Missing binary name.");
  process.exit(1);
}

const cwd = process.cwd();
const localWranglerConfigHome = path.join(cwd, ".wrangler-config");
mkdirSync(localWranglerConfigHome, { recursive: true });

const env = {
  ...process.env,
  XDG_CONFIG_HOME: process.env.XDG_CONFIG_HOME || localWranglerConfigHome,
  WRANGLER_HOME: process.env.WRANGLER_HOME || localWranglerConfigHome,
};

const child = process.platform === "win32"
  ? spawn(`"${path.join(cwd, "node_modules", ".bin", `${binName}.cmd`)}" ${args.join(" ")}`, [], {
      cwd,
      stdio: "inherit",
      shell: true,
      env,
    })
  : spawn(path.join(cwd, "node_modules", ".bin", binName), args, {
      cwd,
      stdio: "inherit",
      shell: false,
      env,
  });

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
