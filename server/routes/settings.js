import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { settings } from '../db/schema.js'
import { settingsSchema } from '../lib/validate.js'
import { reclassifyAll } from '../gmail/sync.js'

const router = Router()

router.get('/', async (req, res) => {
  const row = (await db.select().from(settings).where(eq(settings.userId, req.session.userId)))[0]
  res.json(row || { userId: req.session.userId, autoSort: true })
})

router.put('/', async (req, res) => {
  const parsed = settingsSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const existing = (await db.select().from(settings).where(eq(settings.userId, req.session.userId)))[0]
  let row
  if (existing) {
    row = (await db.update(settings).set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(settings.userId, req.session.userId)).returning())[0]
  } else {
    row = (await db.insert(settings).values({ userId: req.session.userId, ...parsed.data }).returning())[0]
  }
  await reclassifyAll(req.session.userId).catch(() => {})
  res.json(row)
})

export default router
