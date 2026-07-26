import { GOOGLE_SCOPES, getGoogleRedirectUri, getSiteUrl, isLocalhostUrl } from "@/lib/auth/config";
import { getRuntimeAuthEnv } from "@/lib/auth/db";

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

export type GoogleUserProfile = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
};

export async function getGoogleClientConfig() {
  const runtimeEnv = await getRuntimeAuthEnv();
  const preferProcessEnv = isLocalhostUrl(getSiteUrl());
  const clientId = preferProcessEnv
    ? process.env.GOOGLE_CLIENT_ID || runtimeEnv.GOOGLE_CLIENT_ID
    : runtimeEnv.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = preferProcessEnv
    ? process.env.GOOGLE_CLIENT_SECRET || runtimeEnv.GOOGLE_CLIENT_SECRET
    : runtimeEnv.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Google OAuth credentials.");
  }

  return {
    clientId,
    clientSecret,
    redirectUri: preferProcessEnv
      ? process.env.GOOGLE_OAUTH_REDIRECT_URI || runtimeEnv.GOOGLE_OAUTH_REDIRECT_URI || getGoogleRedirectUri()
      : runtimeEnv.GOOGLE_OAUTH_REDIRECT_URI || process.env.GOOGLE_OAUTH_REDIRECT_URI || getGoogleRedirectUri(),
  };
}

export function buildGoogleAuthorizationUrl(args: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", args.clientId);
  url.searchParams.set("redirect_uri", args.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_SCOPES.join(" "));
  url.searchParams.set("state", args.state);
  url.searchParams.set("code_challenge", args.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "select_account");
  return url;
}

export async function exchangeGoogleCode(args: {
  code: string;
  codeVerifier: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: args.code,
      client_id: args.clientId,
      client_secret: args.clientSecret,
      redirect_uri: args.redirectUri,
      grant_type: "authorization_code",
      code_verifier: args.codeVerifier,
    }),
  });

  const payload = (await response.json()) as GoogleTokenResponse;
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || "Google token exchange failed.");
  }

  return payload.access_token;
}

export async function fetchGoogleUserProfile(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const payload = (await response.json()) as GoogleUserProfile & { error?: string };
  if (!response.ok || !payload.sub || !payload.email) {
    throw new Error(payload.error || "Failed to load Google profile.");
  }

  return payload;
}
