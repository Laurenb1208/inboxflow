import express from 'express'
import session from 'express-session'
import ConnectPgSimple from 'connect-pg-simple'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from './db/client.js'
import authRoutes from './auth/routes.js'
import { requireAuth } from './auth/middleware.js'
import foldersRoutes from './routes/folders.js'
import filtersRoutes from './routes/filters.js'
import settingsRoutes from './routes/settings.js'
import emailsRoutes from './routes/emails.js'
import syncRoutes from './routes/sync.js'
import analyticsRoutes from './routes/analytics.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'

// ── Startup environment check ──────────────────────────────────────────────
const REQUIRED_VARS = ['DATABASE_URL', 'SESSION_SECRET', 'TOKEN_ENCRYPTION_KEY', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
const OPTIONAL_VARS = ['GOOGLE_REDIRECT_URI']
let startupOk = true
for (const v of REQUIRED_VARS) {
  if (!process.env[v]) {
    console.error(`[inboxflow] MISSING required env var: ${v}`)
    startupOk = false
  }
}
for (const v of OPTIONAL_VARS) {
  console.log(`[inboxflow] ${v}: ${process.env[v] ? process.env[v] : '(not set — will derive from request)'}`)
}
if (!startupOk) {
  console.error('[inboxflow] Missing required env vars — some features will not work')
}
// Validate TOKEN_ENCRYPTION_KEY length (must decode to 32 bytes)
if (process.env.TOKEN_ENCRYPTION_KEY) {
  const keyBytes = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY, 'base64').length
  if (keyBytes !== 32) {
    console.error(`[inboxflow] TOKEN_ENCRYPTION_KEY decoded to ${keyBytes} bytes — must be exactly 32 bytes (44 base64 chars)`)
  }
}
// ──────────────────────────────────────────────────────────────────────────

// Catch unhandled errors so the process never silently dies
process.on('uncaughtException', (err) => {
  console.error('[inboxflow] uncaughtException:', err)
})
process.on('unhandledRejection', (reason) => {
  console.error('[inboxflow] unhandledRejection:', reason)
})

pool.on('error', (err) => {
  console.error('[inboxflow] pg pool error:', err.message)
})

const app = express()
app.set('trust proxy', 1)
app.use(express.json({ limit: '1mb' }))

const PgStore = ConnectPgSimple(session)
app.use(session({
  store: new PgStore({ pool, tableName: 'session', createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || 'dev-only-not-secret',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
  name: 'connect.sid',
}))

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }))

// Auth (public)
app.use('/api/auth', authRoutes)

// Authed
app.use('/api/folders', requireAuth, foldersRoutes)
app.use('/api/filters', requireAuth, filtersRoutes)
app.use('/api/settings', requireAuth, settingsRoutes)
app.use('/api/emails', requireAuth, emailsRoutes)
app.use('/api/sync', requireAuth, syncRoutes)
app.use('/api/analytics', requireAuth, analyticsRoutes)

// Production: serve built frontend
if (isProd) {
  const distDir = path.join(__dirname, '..', 'dist')
  app.use(express.static(distDir))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

// Always listen on 0.0.0.0 so both IPv4 (127.0.0.1) and IPv6 (::1) work.
// In dev the Vite proxy targets 127.0.0.1:3001 — 0.0.0.0 covers that.
const PORT = isProd ? parseInt(process.env.PORT || '5000', 10) : 3001

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[inboxflow] API listening on 0.0.0.0:${PORT} (${process.env.NODE_ENV || 'development'})`)
})

server.on('error', (err) => {
  console.error('[inboxflow] server error:', err.message)
  if (err.code === 'EADDRINUSE') {
    console.error(`[inboxflow] Port ${PORT} already in use — is another instance running?`)
    process.exit(1)
  }
})
