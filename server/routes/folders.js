import { Router } from 'express'
import { eq, and, asc } from 'drizzle-orm'
import { db } from '../db/client.js'
import { folders } from '../db/schema.js'
import { folderSchema } from '../lib/validate.js'
import { reclassifyAll } from '../gmail/sync.js'

const router = Router()

router.get('/', async (req, res) => {
  const rows = await db.select().from(folders).where(eq(folders.userId, req.session.userId)).orderBy(asc(folders.createdAt))
  res.json(rows)
})

router.post('/', async (req, res) => {
  const parsed = folderSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  try {
    const row = (await db.insert(folders).values({ ...parsed.data, userId: req.session.userId }).returning())[0]
    res.status(201).json(row)
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'A folder with that name already exists' })
    throw e
  }
})

router.patch('/:id', async (req, res) => {
  const parsed = folderSchema.partial().safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const updated = (await db.update(folders).set(parsed.data)
    .where(and(eq(folders.id, req.params.id), eq(folders.userId, req.session.userId)))
    .returning())[0]
  if (!updated) return res.status(404).json({ error: 'Not found' })
  res.json(updated)
})

router.delete('/:id', async (req, res) => {
  await db.delete(folders).where(and(eq(folders.id, req.params.id), eq(folders.userId, req.session.userId)))
  await reclassifyAll(req.session.userId).catch(() => {})
  res.json({ ok: true })
})

export default router
