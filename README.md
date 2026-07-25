# Image Background Remover

A privacy-aware, no-signup image background remover built with Next.js, React, TypeScript, and Tailwind CSS.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Add a Remove.bg API key and Cloudflare Turnstile keys.
3. Run `npm install` and `npm run dev`.
4. Open `http://localhost:3000`.

Turnstile is bypassed only in non-production environments when no secret is configured. Remove.bg processing always requires `REMOVE_BG_API_KEY`.

## API

- `POST /api/remove-background` — accepts `multipart/form-data` with `image_file`, `turnstile_token`, `size=auto`, and `format=png`.
- `GET /api/health` — returns `{ "status": "ok" }` without contacting Remove.bg.

Uploaded images and results are streamed through the request lifecycle and are not intentionally persisted by this application.
