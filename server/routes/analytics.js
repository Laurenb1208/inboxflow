import { Router } from 'express'
import { eq, and, sql, desc } from 'drizzle-orm'
import { db } from '../db/client.js'
import { emails, syncLog } from '../db/schema.js'

const router = Router()

router.get('/', async (req, res) => {
  const userId = req.session.userId
  const totalRow = (await db.select({ c: sql`count(*)::int` }).from(emails).where(eq(emails.userId, userId)))[0]
  const categorizedRow = (await db.select({ c: sql`count(*)::int` }).from(emails)
    .where(and(eq(emails.userId, userId), sql`${emails.folderId} is not null`)))[0]
  const highRow = (await db.select({ c: sql`count(*)::int` }).from(emails)
    .where(and(eq(emails.userId, userId), eq(emails.priority, 'High'))))[0]
  const lastSync = (await db.select().from(syncLog).where(eq(syncLog.userId, userId))
    .orderBy(desc(syncLog.startedAt)).limit(1))[0]

  const total = totalRow.c
  const categorized = categorizedRow.c
  res.json({
    total,
    categorized,
    percentCategorized: total ? Math.round((categorized / total) * 100) : 0,
    highPriority: highRow.c,
    lastSyncAt: lastSync?.finishedAt || lastSync?.startedAt || null,
    lastSyncStatus: lastSync?.status || null,
  })
})

export default router
