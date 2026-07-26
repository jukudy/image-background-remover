import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getAuthDb() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (!env.AUTH_DB) {
      throw new Error("Missing AUTH_DB D1 binding.");
    }
    return env.AUTH_DB;
  } catch (error) {
    throw new Error(
      `Unable to access the AUTH_DB D1 binding in local development. ` +
        `Run the local D1 migration script and make sure Next dev starts with the workspace-scoped Wrangler config. ` +
        `Original error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function getRuntimeAuthEnv() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env;
  } catch {
    return {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_OAUTH_REDIRECT_URI: process.env.GOOGLE_OAUTH_REDIRECT_URI,
      SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
    };
  }
}
