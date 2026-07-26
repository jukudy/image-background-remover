export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
export const OAUTH_STATE_TTL_SECONDS = 60 * 10;
export const DEFAULT_SESSION_COOKIE_NAME = "clearcut_session";
export const GOOGLE_SCOPES = ["openid", "email", "profile"];

export function getSessionCookieName() {
  return process.env.SESSION_COOKIE_NAME || DEFAULT_SESSION_COOKIE_NAME;
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export function getGoogleRedirectUri() {
  return process.env.GOOGLE_OAUTH_REDIRECT_URI || `${getSiteUrl()}/api/auth/google/callback`;
}

export function shouldUseSecureCookies() {
  return getSiteUrl().startsWith("https://");
}

export function sanitizeReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith("/")) return "/";
  if (value.startsWith("//")) return "/";
  return value;
}

export function isLocalhostUrl(value: string) {
  const hostname = new URL(value).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
}
