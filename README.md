# Image Background Remover

A privacy-aware, no-signup image background remover built with Next.js, React, TypeScript, and Tailwind CSS.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Add a Remove.bg API key and Cloudflare Turnstile keys.
3. If you want Google login locally, also add Google OAuth credentials and a localhost callback URI in `.env.local`.
4. Run `npm install` and `npm run dev`.
5. Open `http://localhost:3000`.

Turnstile is bypassed only in non-production environments when no secret is configured. Remove.bg processing always requires `REMOVE_BG_API_KEY`.

## Google OAuth + D1

This project includes a Google OAuth flow backed by Cloudflare D1:

- `GET /api/auth/google` starts the OAuth flow
- `GET /api/auth/google/callback` handles the Google callback
- `POST /api/auth/logout` clears the login session
- `GET /api/auth/me` returns the current authenticated user

The D1 schema lives in `migrations/0001_google_oauth_auth.sql`.

### Production values

Use these production values in Cloudflare:

- `NEXT_PUBLIC_SITE_URL=https://www.clearcut.help`
- `GOOGLE_OAUTH_REDIRECT_URI=https://www.clearcut.help/api/auth/google/callback`
- `GOOGLE_CLIENT_ID=<your Google OAuth client id>`
- `GOOGLE_CLIENT_SECRET=<store as a Wrangler secret>`

### Cloudflare setup

1. Create the D1 database:
   `wrangler d1 create clearcut-auth`
2. Copy the returned `database_id` into `wrangler.jsonc`.
3. Apply migrations:
   `npm run cf:d1:migrate:local`
   `npm run cf:d1:migrate:remote`
4. Store secrets in Cloudflare:
   `wrangler secret put GOOGLE_CLIENT_SECRET`
   `wrangler secret put REMOVE_BG_API_KEY`
   `wrangler secret put TURNSTILE_SECRET_KEY`
5. Preview the Cloudflare target:
   `npm run cf:preview`
6. Deploy:
   `npm run cf:deploy`

### Google Console

In Google Cloud Console, configure the OAuth app with:

- Authorized JavaScript origin: `https://www.clearcut.help`
- Authorized redirect URI: `https://www.clearcut.help/api/auth/google/callback`

If you want local Google login during `next dev`, you must also add:

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/google/callback`

### Local auth checklist

1. Copy `.dev.vars.example` to `.dev.vars`
2. Fill the Google client ID and secret in `.dev.vars`
3. Run the local D1 migration:
   `npm run auth:local:migrate`
4. Start dev:
   `npm run dev`
5. Verify setup:
   `npm run auth:local:doctor`

## API

- `POST /api/remove-background` — accepts `multipart/form-data` with `image_file`, `turnstile_token`, `size=auto`, and `format=png`.
- `GET /api/health` — returns `{ "status": "ok" }` without contacting Remove.bg.

Uploaded images and results are streamed through the request lifecycle and are not intentionally persisted by this application.
