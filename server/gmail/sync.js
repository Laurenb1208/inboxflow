import { eq, and } from 'drizzle-orm'
import { db } from '../db/client.js'
import { emails, folders, filters as filtersT, syncLog, settings as settingsT } from '../db/schema.js'
import { getGmailForUser } from './client.js'
import { classify } from './classify.js'

const MAX_MESSAGES = 100

function parseFrom(headerValue) {
  if (!headerValue) return { fromAddr: null, fromName: null }
  const m = headerValue.match(/^\s*"?([^"<]*)"?\s*<?([^<>]*@[^<>]+)>?\s*$/)
  if (m) return { fromName: m[1].trim() || null, fromAddr: m[2].trim() }
  return { fromName: null, fromAddr: headerValue.trim() }
}

function getHeader(headers, name) {
  const h = headers?.find(h => h.name?.toLowerCase() === name.toLowerCase())
  return h?.value || null
}

export async function runSync(req, userId) {
  const log = (await db.insert(syncLog).values({ userId, status: 'running' }).returning())[0]
  let fetched = 0, classified = 0
  try {
    const gmail = await getGmailForUser(req, userId)
    const list = await gmail.users.messages.list({
      userId: 'me', maxResults: MAX_MESSAGES, labelIds: ['INBOX'],
    })
    const msgIds = (list.data.messages || []).map(m => m.id)

    const userFolders = await db.select().from(folders).where(eq(folders.userId, userId))
    const userFilters = await db.select().from(filtersT).where(eq(filtersT.userId, userId))
    const userSettings = (await db.select().from(settingsT).where(eq(settingsT.userId, userId)))[0]
    const autoSort = userSettings?.autoSort ?? true

    for (const id of msgIds) {
      try {
        const msg = await gmail.users.messages.get({
          userId: 'me', id, format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        })
        const payload = msg.data.payload
        const headers = payload?.headers || []
        const subject = getHeader(headers, 'Subject')
        const from = getHeader(headers, 'From')
        const dateHdr = getHeader(headers, 'Date')
        const { fromAddr, fromName } = parseFrom(from)
        const snippet = msg.data.snippet || ''
        const receivedAt = msg.data.internalDate
          ? new Date(parseInt(msg.data.internalDate, 10))
          : (dateHdr ? new Date(dateHdr) : null)
        const labels = msg.data.labelIds || []

        const result = autoSort
          ? classify({ subject, snippet, fromAddr, fromName }, userFilters, userFolders)
          : { folderId: null, priority: null, matchedFilterId: null }

        const existing = (await db.select().from(emails).where(
          and(eq(emails.userId, userId), eq(emails.gmailMessageId, id))
        ))[0]

        if (existing) {
          await db.update(emails).set({
            fromAddr, fromName, subject, snippet, receivedAt, labels,
            folderId: result.folderId, priority: result.priority, matchedFilterId: result.matchedFilterId,
            syncedAt: new Date(),
          }).where(eq(emails.id, existing.id))
        } else {
          await db.insert(emails).values({
            userId, gmailMessageId: id, gmailThreadId: msg.data.threadId,
            fromAddr, fromName, subject, snippet, receivedAt, labels,
            folderId: result.folderId, priority: result.priority, matchedFilterId: result.matchedFilterId,
          })
        }
        fetched++
        if (result.folderId) classified++
      } catch (e) {
        console.error('msg sync error', id, e.message)
      }
    }

    await db.update(syncLog).set({
      finishedAt: new Date(), fetchedCount: fetched, classifiedCount: classified, status: 'ok',
    }).where(eq(syncLog.id, log.id))
    return { fetched, classified }
  } catch (e) {
    await db.update(syncLog).set({
      finishedAt: new Date(), fetchedCount: fetched, classifiedCount: classified,
      status: 'error', errorMessage: e.message,
    }).where(eq(syncLog.id, log.id))
    throw e
  }
}

export async function reclassifyAll(userId) {
  const userFolders = await db.select().from(folders).where(eq(folders.userId, userId))
  const userFilters = await db.select().from(filtersT).where(eq(filtersT.userId, userId))
  const userSettings = (await db.select().from(settingsT).where(eq(settingsT.userId, userId)))[0]
  const autoSort = userSettings?.autoSort ?? true
  const all = await db.select().from(emails).where(eq(emails.userId, userId))
  for (const e of all) {
    const result = autoSort
      ? classify({ subject: e.subject, snippet: e.snippet, fromAddr: e.fromAddr, fromName: e.fromName }, userFilters, userFolders)
      : { folderId: null, priority: null, matchedFilterId: null }
    await db.update(emails).set({
      folderId: result.folderId, priority: result.priority, matchedFilterId: result.matchedFilterId,
    }).where(eq(emails.id, e.id))
  }
}
