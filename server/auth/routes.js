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
  { name: 'Meetings', keywords: 'zoom, calendar', folder: 'Meetings', priority: 'High', rank: 1 },
  { name: 'Clients', keywords: 'contract, proposal', folder: 'Clients', priority: 'Medium', rank: 2 },
  { name: 'Internal', keywords: 'update, FYI', folder: 'Internal', priority: 'Low', rank: 3 },
]

router.get('/google', (req, res) => {
  const client = makeOAuthClient(req)
  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    include_granted_scopes: true,
  })
  res.redirect(url)
})

router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query
  if (error || !code) {
    return res.redirect('/login?error=' + encodeURIComponent(error || 'no_code'))
  }
  try {
    const client = makeOAuthClient(req)
    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    const oauth2 = google.oauth2({ version: 'v2', auth: client })
    const profile = (await oauth2.userinfo.get()).data

    let user = (await db.select().from(users).where(eq(users.googleSub, profile.id)))[0]
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
    } else {
      await db.update(users).set({
        email: profile.email, name: profile.name, picture: profile.picture,
      }).where(eq(users.id, user.id))
    }

    if (tokens.refresh_token) {
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
    }

    req.session.userId = user.id
    res.redirect('/settings')
  } catch (e) {
    console.error('OAuth callback error:', e)
    res.redirect('/login?error=' + encodeURIComponent(e.message))
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
