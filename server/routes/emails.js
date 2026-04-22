import { Router } from 'express'
import { and, eq, desc, ilike, or, sql } from 'drizzle-orm'
import { db } from '../db/client.js'
import { emails, folders } from '../db/schema.js'

const router = Router()

router.get('/', async (req, res) => {
  const { folderId, priority, q, important } = req.query
  const conds = [eq(emails.userId, req.session.userId)]
  if (folderId === 'uncategorized') conds.push(sql`${emails.folderId} is null`)
  else if (folderId) conds.push(eq(emails.folderId, folderId))
  if (priority) conds.push(eq(emails.priority, priority))
  if (important === 'true') conds.push(eq(emails.manuallyImportant, true))
  if (q) {
    const like = `%${q}%`
    conds.push(or(
      ilike(emails.subject, like),
      ilike(emails.snippet, like),
      ilike(emails.fromAddr, like),
      ilike(emails.fromName, like),
    ))
  }

  const rows = await db.select({
    id: emails.id, gmailMessageId: emails.gmailMessageId, fromAddr: emails.fromAddr,
    fromName: emails.fromName, subject: emails.subject, snippet: emails.snippet,
    receivedAt: emails.receivedAt, folderId: emails.folderId, priority: emails.priority,
    manuallyImportant: emails.manuallyImportant, folderName: folders.name, folderColor: folders.color,
  })
    .from(emails)
    .leftJoin(folders, eq(emails.folderId, folders.id))
    .where(and(...conds))
    .orderBy(desc(emails.receivedAt))
    .limit(200)

  res.json(rows)
})

router.get('/:id', async (req, res) => {
  const row = (await db.select().from(emails)
    .where(and(eq(emails.id, req.params.id), eq(emails.userId, req.session.userId))))[0]
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json(row)
})

router.patch('/:id/important', async (req, res) => {
  const { important } = req.body
  const updated = (await db.update(emails).set({ manuallyImportant: !!important })
    .where(and(eq(emails.id, req.params.id), eq(emails.userId, req.session.userId)))
    .returning())[0]
  if (!updated) return res.status(404).json({ error: 'Not found' })
  res.json(updated)
})

export default router
