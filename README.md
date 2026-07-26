# Image Background Remover

A privacy-aware image background remover built with Next.js App Router, React, TypeScript, Tailwind CSS, and Google sign-in powered by NextAuth.js.

## Current stack

- `next@16.2.11`
- `react@19.2.4`
- `next-auth@4`
- JWT-only sessions with no database dependency

## Local development

1. Install dependencies:
   `npm install`
2. Fill `.env.local` from `.env.example`
3. Start the app:
   `npm run dev`
4. Open `http://localhost:3000`

## Local environment variables

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-random-32-byte-secret
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
REMOVE_BG_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APP_ENV=development
```

Generate the auth secret with:

`openssl rand -base64 32`

## Google sign-in routes

NextAuth.js now owns the whole auth flow:

- `GET /api/auth/signin/google`
- `GET /api/auth/callback/google`
- `POST /api/auth/signout`
- `GET /api/auth/session`

## Vercel production environment variables

```env
NEXT_PUBLIC_SITE_URL=https://www.clearcut.help
NEXTAUTH_URL=https://www.clearcut.help
NEXTAUTH_SECRET=replace-with-a-random-32-byte-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
REMOVE_BG_API_KEY=your-remove-bg-api-key
APP_ENV=production
```

## Google Cloud Console

Recommended production OAuth settings:

- Authorized JavaScript origin: `https://www.clearcut.help`
- Authorized redirect URI: `https://www.clearcut.help/api/auth/callback/google`

Recommended local OAuth settings:

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

## Domain policy

`next.config.ts` permanently redirects every `*.vercel.app` hostname to `https://www.clearcut.help` so cookies and OAuth callbacks stay on a single canonical origin.

## API

- `POST /api/remove-background` accepts `multipart/form-data` with `image_file`, `turnstile_token`, `size=auto`, and `format=png`
- `GET /api/health` returns `{ "status": "ok" }`
