import { cookies } from "next/headers";
import { getSessionCookieName, OAUTH_STATE_TTL_SECONDS, SESSION_TTL_SECONDS, shouldUseSecureCookies } from "@/lib/auth/config";
import { createOpaqueToken, sha256 } from "@/lib/auth/crypto";
import { getAuthDb } from "@/lib/auth/db";

export type AuthUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  givenName: string | null;
  familyName: string | null;
  picture: string | null;
  locale: string | null;
};

export type AuthSession = {
  id: string;
  user: AuthUser;
  expiresAt: number;
};

type SessionRow = {
  session_id: string;
  expires_at: number;
  user_id: string;
  email: string;
  email_verified: number;
  name: string | null;
  given_name: string | null;
  family_name: string | null;
  picture: string | null;
  locale: string | null;
};

export function getSessionCookieOptions(expiresAt: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: shouldUseSecureCookies(),
    path: "/",
    expires: new Date(expiresAt * 1000),
  };
}

export async function createSession(userId: string, ipAddress: string | null, userAgent: string | null) {
  const db = await getAuthDb();
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + SESSION_TTL_SECONDS;
  const sessionId = crypto.randomUUID();
  const token = createOpaqueToken(32);
  const tokenHash = sha256(token);

  await db
    .prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at, last_seen_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(sessionId, userId, tokenHash, expiresAt, now, now, ipAddress, userAgent)
    .run();

  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), token, getSessionCookieOptions(expiresAt));
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    path: "/",
    expires: new Date(0),
  });
}

export async function destroySessionFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  if (!token) {
    await clearSessionCookie();
    return;
  }

  const db = await getAuthDb();
  await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(sha256(token)).run();
  await clearSessionCookie();
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  if (!token) return null;

  const db = await getAuthDb();
  const now = Math.floor(Date.now() / 1000);
  const row = await db
    .prepare(
      `SELECT
        sessions.id AS session_id,
        sessions.expires_at,
        users.id AS user_id,
        users.email,
        users.email_verified,
        users.name,
        users.given_name,
        users.family_name,
        users.picture,
        users.locale
      FROM sessions
      INNER JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ? AND sessions.expires_at > ?
      LIMIT 1`
    )
    .bind(sha256(token), now)
    .first<SessionRow>();

  if (!row) {
    return null;
  }

  return {
    id: row.session_id,
    expiresAt: row.expires_at,
    user: {
      id: row.user_id,
      email: row.email,
      emailVerified: row.email_verified === 1,
      name: row.name,
      givenName: row.given_name,
      familyName: row.family_name,
      picture: row.picture,
      locale: row.locale,
    },
  } satisfies AuthSession;
}

export async function storeOAuthState(state: string, codeVerifier: string, returnTo: string) {
  const db = await getAuthDb();
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + OAUTH_STATE_TTL_SECONDS;
  await db.prepare("DELETE FROM oauth_states WHERE expires_at <= ?").bind(now).run();
  await db
    .prepare("INSERT INTO oauth_states (state, code_verifier, return_to, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(state, codeVerifier, returnTo, expiresAt, now)
    .run();
}

export async function consumeOAuthState(state: string) {
  const db = await getAuthDb();
  const now = Math.floor(Date.now() / 1000);
  const row = await db
    .prepare("SELECT state, code_verifier, return_to, expires_at FROM oauth_states WHERE state = ? AND expires_at > ? LIMIT 1")
    .bind(state, now)
    .first<{ state: string; code_verifier: string; return_to: string; expires_at: number }>();

  if (!row) return null;

  await db.prepare("DELETE FROM oauth_states WHERE state = ?").bind(state).run();
  return row;
}
