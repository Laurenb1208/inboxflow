import { Router } from 'express'
import { google } from 'googleapis'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { users, oauthTokens, settings, folders, filters } from '../db/schema.js'
import { makeOAuthClient, SCOPES } from './google.js'
import { encrypt } from '../lib/crypto.js'

const router = Router()

const SAMPLE_FOLDERS = [
  { name: 'Meetings', color: 'Blue', priority: 'High' },
  { name: 'Clients', color: 'Green', priority: 'Medium' },
  { name: 'Internal', color: 'Purple', priority: 'Low' },
]

const SAMPLE_FILTERS = [
  { name: 'Meetings', keywords: 'zoom, calendar, invite, meeting', folder: 'Meetings', priority: 'High', rank: 1 },
  { name: 'Clients', keywords: 'contract, proposal, invoice, follow-up', folder: 'Clients', priority: 'Medium', rank: 2 },
  { name: 'Internal', keywords: 'update, FYI, internal, team', folder: 'Internal', priority: 'Low', rank: 3 },
]

// Step 1 — redirect the browser to Google's consent screen
router.get('/google', (req, res) => {
  const client = makeOAuthClient(req)
  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    include_granted_scopes: true,
  })
  console.log('[auth] Starting OAuth flow, redirect_uri:', process.env.GOOGLE_REDIRECT_URI || '(derived from request)')
  res.redirect(url)
})

// Step 2 — Google redirects back here with ?code=...
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query
  if (error || !code) {
    console.error('[auth] OAuth returned error:', error || 'no_code')
    return res.redirect('/login?error=' + encodeURIComponent(error || 'no_code'))
  }

  try {
    // Exchange code for tokens
    const client = makeOAuthClient(req)
    let tokens
    try {
      ;({ tokens } = await client.getToken(code))
    } catch (e) {
      console.error('[auth] Token exchange failed:', e.message, e.response?.data)
      return res.redirect('/login?error=' + encodeURIComponent('token_exchange_failed: ' + e.message))
    }
    client.setCredentials(tokens)

    // Get Google profile
    let profile
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: client })
      profile = (await oauth2.userinfo.get()).data
    } catch (e) {
      console.error('[auth] Failed to fetch user profile:', e.message)
      return res.redirect('/login?error=' + encodeURIComponent('profile_fetch_failed'))
    }
    console.log('[auth] Authenticated:', profile.email)

    // Upsert user in database
    let user
    try {
      user = (await db.select().from(users).where(eq(users.googleSub, profile.id)))[0]
      if (!user) {
        user = (await db.insert(users).values({
          googleSub: profile.id,
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          provider: 'gmail',
        }).returning())[0]
        await db.insert(settings).values({ userId: user.id, autoSort: true })
        const inserted = await db.insert(folders).values(
          SAMPLE_FOLDERS.map(f => ({ ...f, userId: user.id }))
        ).returning()
        const byName = Object.fromEntries(inserted.map(f => [f.name, f.id]))
        await db.insert(filters).values(
          SAMPLE_FILTERS.map(f => ({
            userId: user.id, name: f.name, keywords: f.keywords,
            folderId: byName[f.folder], priority: f.priority, rank: f.rank,
          }))
        )
        console.log('[auth] New user created:', user.email)
      } else {
        await db.update(users).set({
          email: profile.email, name: profile.name, picture: profile.picture,
        }).where(eq(users.id, user.id))
        console.log('[auth] Existing user logged in:', user.email)
      }
    } catch (e) {
      console.error('[auth] Database error during user upsert:', e.message)
      const isTableMissing = e.message?.includes('relation') && e.message?.includes('does not exist')
      const friendly = isTableMissing
        ? 'Database not initialised — run npm start to apply the schema and try again.'
        : 'A database error occurred. Please try signing in again.'
      return res.redirect('/login?error=' + encodeURIComponent(friendly))
    }

    // Store refresh token (encrypted) if present
    if (tokens.refresh_token) {
      try {
        const { ciphertext, iv } = encrypt(tokens.refresh_token)
        const existing = (await db.select().from(oauthTokens).where(eq(oauthTokens.userId, user.id)))[0]
        if (existing) {
          await db.update(oauthTokens).set({
            refreshTokenEnc: ciphertext, iv, scope: tokens.scope, lastRefreshedAt: new Date(),
          }).where(eq(oauthTokens.userId, user.id))
        } else {
          await db.insert(oauthTokens).values({
            userId: user.id, provider: 'gmail',
            refreshTokenEnc: ciphertext, iv, scope: tokens.scope,
          })
        }
      } catch (e) {
        // Token storage failing should not block login — log and continue
        console.error('[auth] Failed to store refresh token:', e.message)
      }
    }

    // Set session and wait for the store to persist it before redirecting.
    // Without session.save(), the pg store write is async and the browser
    // may follow the redirect before the row exists — causing /api/auth/me
    // to return null and the user to appear logged out.
    req.session.userId = user.id
    req.session.save((err) => {
      if (err) {
        console.error('[auth] Session save error:', err)
        return res.redirect('/login?error=' + encodeURIComponent('session_error'))
      }
      console.log('[auth] Session saved, redirecting to /settings')
      res.redirect('/settings')
    })
  } catch (e) {
    console.error('[auth] OAuth callback unhandled error:', e)
    res.redirect('/login?error=' + encodeURIComponent('Sign-in failed. Please try again.'))
  }
})

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid')
    res.json({ ok: true })
  })
})

router.get('/me', async (req, res) => {
  if (!req.session?.userId) return res.json({ user: null })
  const user = (await db.select().from(users).where(eq(users.id, req.session.userId)))[0]
  if (!user) return res.json({ user: null })
  const tok = (await db.select().from(oauthTokens).where(eq(oauthTokens.userId, user.id)))[0]
  res.json({
    user: {
      id: user.id, email: user.email, name: user.name, picture: user.picture,
      provider: user.provider, connected: !!tok,
    },
  })
})

export default router
