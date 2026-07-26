import { getAuthDb } from "@/lib/auth/db";
import type { GoogleUserProfile } from "@/lib/auth/google";

export async function upsertGoogleUser(profile: GoogleUserProfile) {
  const db = await getAuthDb();
  const now = Math.floor(Date.now() / 1000);

  const existing = await db
    .prepare(
      `SELECT users.id
       FROM oauth_accounts
       INNER JOIN users ON users.id = oauth_accounts.user_id
       WHERE oauth_accounts.provider = 'google' AND oauth_accounts.provider_account_id = ?
       LIMIT 1`
    )
    .bind(profile.sub)
    .first<{ id: string }>();

  const userId = existing?.id || crypto.randomUUID();

  await db.batch([
    db
      .prepare(
        `INSERT INTO users (id, email, email_verified, name, given_name, family_name, picture, locale, created_at, updated_at, last_login_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           email = excluded.email,
           email_verified = excluded.email_verified,
           name = excluded.name,
           given_name = excluded.given_name,
           family_name = excluded.family_name,
           picture = excluded.picture,
           locale = excluded.locale,
           updated_at = excluded.updated_at,
           last_login_at = excluded.last_login_at`
      )
      .bind(
        userId,
        profile.email,
        profile.email_verified ? 1 : 0,
        profile.name || null,
        profile.given_name || null,
        profile.family_name || null,
        profile.picture || null,
        profile.locale || null,
        now,
        now,
        now
      ),
    db
      .prepare(
        `INSERT INTO oauth_accounts (id, provider, provider_account_id, user_id, email, created_at, updated_at)
         VALUES (?, 'google', ?, ?, ?, ?, ?)
         ON CONFLICT(provider, provider_account_id) DO UPDATE SET
           user_id = excluded.user_id,
           email = excluded.email,
           updated_at = excluded.updated_at`
      )
      .bind(crypto.randomUUID(), profile.sub, userId, profile.email, now, now),
  ]);

  return userId;
}
