import express from 'express'
import session from 'express-session'
import ConnectPgSimple from 'connect-pg-simple'
import cookieParser from 'cookie-parser'
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

const app = express()
app.set('trust proxy', 1)
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

const PgStore = ConnectPgSimple(session)
app.use(session({
  store: new PgStore({ pool, tableName: 'session', createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || 'dev-only-not-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
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
if (process.env.NODE_ENV === 'production') {
  const distDir = path.join(__dirname, '..', 'dist')
  app.use(express.static(distDir))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

const PORT = parseInt(process.env.PORT || '5000', 10)
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'
const BACKEND_PORT = process.env.NODE_ENV === 'production' ? PORT : 3001

const listenPort = process.env.NODE_ENV === 'production' ? PORT : BACKEND_PORT
const listenHost = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'

app.listen(listenPort, listenHost, () => {
  console.log(`[inboxflow] API listening on ${listenHost}:${listenPort} (${process.env.NODE_ENV || 'development'})`)
})
