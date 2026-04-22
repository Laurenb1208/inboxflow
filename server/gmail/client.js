import { google } from 'googleapis'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { oauthTokens } from '../db/schema.js'
import { decrypt } from '../lib/crypto.js'
import { makeOAuthClient } from '../auth/google.js'

export async function getGmailForUser(req, userId) {
  const tok = (await db.select().from(oauthTokens).where(eq(oauthTokens.userId, userId)))[0]
  if (!tok) throw new Error('Gmail not connected')
  const refreshToken = decrypt(tok.refreshTokenEnc, tok.iv)
  const client = makeOAuthClient(req)
  client.setCredentials({ refresh_token: refreshToken })
  return google.gmail({ version: 'v1', auth: client })
}
