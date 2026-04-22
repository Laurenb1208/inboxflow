import { Router } from 'express'
import { eq, and, asc } from 'drizzle-orm'
import { db } from '../db/client.js'
import { filters } from '../db/schema.js'
import { filterSchema } from '../lib/validate.js'
import { reclassifyAll } from '../gmail/sync.js'

const router = Router()

router.get('/', async (req, res) => {
  const rows = await db.select().from(filters).where(eq(filters.userId, req.session.userId)).orderBy(asc(filters.rank))
  res.json(rows)
})

router.post('/', async (req, res) => {
  const parsed = filterSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const row = (await db.insert(filters).values({ ...parsed.data, userId: req.session.userId }).returning())[0]
  await reclassifyAll(req.session.userId).catch(() => {})
  res.status(201).json(row)
})

router.patch('/:id', async (req, res) => {
  const parsed = filterSchema.partial().safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const updated = (await db.update(filters).set(parsed.data)
    .where(and(eq(filters.id, req.params.id), eq(filters.userId, req.session.userId)))
    .returning())[0]
  if (!updated) return res.status(404).json({ error: 'Not found' })
  await reclassifyAll(req.session.userId).catch(() => {})
  res.json(updated)
})

router.delete('/:id', async (req, res) => {
  await db.delete(filters).where(and(eq(filters.id, req.params.id), eq(filters.userId, req.session.userId)))
  await reclassifyAll(req.session.userId).catch(() => {})
  res.json({ ok: true })
})

export default router
