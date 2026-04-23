# InboxFlow

Full-stack email organization web app. React + Vite frontend, Node/Express backend, Postgres via Drizzle ORM, Google OAuth + Gmail API.

## Architecture

- **Frontend**: React 18 + Vite, served on port 5000 in dev. Routes: `/`, `/login`, `/inbox`, `/settings`, `/pricing`, `/about`, `/contact`, `/privacy`.
- **Backend**: Express on port 3001 in dev (Vite proxies `/api` → 3001). In production (`NODE_ENV=production`), Express serves the built `dist/` and listens on `PORT` (5000).
- **DB**: Postgres via `DATABASE_URL`. Tables managed by Drizzle (`server/db/schema.js`). Sessions stored in `session` table via `connect-pg-simple`.
- **Auth**: Google OAuth 2.0 with `gmail.readonly`, `email`, `profile`, `openid` scopes. Refresh tokens encrypted at rest with AES-256-GCM (`TOKEN_ENCRYPTION_KEY`).
- **Sync**: Manual only. Pulls latest 100 INBOX messages per click, classifies each by user-defined keyword filters (subject + snippet + sender), stores metadata + 200-char snippet only.
- **UX model**: Folders are the primary concept. Creating a folder auto-creates a linked keyword filter. The inbox sidebar filters by folder only (no separate priority filter). Priority is still assigned internally and shown as a pill on email cards, but is not a sidebar filter option.

## Commands

- `npm run dev` — runs API (`node --watch server/index.js`) and Vite together via concurrently.
- `npm run build` — builds frontend to `dist/`.
- `npm start` — production: `NODE_ENV=production node server/index.js`.
- `npm run db:push` — pushes Drizzle schema to Postgres.

## Required secrets

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google OAuth Web client.
- `SESSION_SECRET` — random string for cookie signing.
- `TOKEN_ENCRYPTION_KEY` — 32 raw bytes, base64-encoded.
- `DATABASE_URL` — provided by Replit Postgres.

## Google OAuth setup (one-time)

In Google Cloud Console → APIs & Services → Credentials → your OAuth client, add this **Authorized redirect URI**:
- Dev: `https://<dev-domain>/api/auth/google/callback`
- Prod: `https://<your-app>.replit.app/api/auth/google/callback` (after publish)

Then add the scope `https://www.googleapis.com/auth/gmail.readonly` to the OAuth consent screen.

## Deployment

Use Autoscale or Reserved VM with build = `npm run build` and run = `npm start`. (Static deployment will not work — backend is required.)

## Project layout

```
server/
  index.js              # Express bootstrap
  auth/                 # google.js, routes.js, middleware.js
  gmail/                # client.js, sync.js, classify.js
  routes/               # folders, filters, settings, emails, sync, analytics
  lib/                  # crypto.js, validate.js, redirect.js
  db/                   # schema.js, client.js
src/
  App.jsx, main.jsx
  context/Auth.jsx
  lib/api.js
  pages/                # Landing, Login, Inbox, Settings, Pricing, About, Contact, Privacy
  components/           # FolderModal, FilterModal, Toast
```
