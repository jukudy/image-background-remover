declare global {
  interface CloudflareEnv {
    AUTH_DB: D1Database;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GOOGLE_OAUTH_REDIRECT_URI?: string;
    SESSION_COOKIE_NAME?: string;
  }
}

export {};
