import { Router } from 'express'
import { runSync } from '../gmail/sync.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const result = await runSync(req, req.session.userId)
    res.json({ ok: true, ...result })
  } catch (e) {
    console.error('sync failed', e)
    res.status(500).json({ ok: false, error: e.message })
  }
})

export default router
