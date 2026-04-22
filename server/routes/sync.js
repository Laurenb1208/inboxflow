import { Router } from 'express'
import { runSync } from '../gmail/sync.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const result = await runSync(req, req.session.userId)
    res.json({ ok: true, ...result })
  } catch (e) {
    console.error('sync failed', e.message)

    // 403 insufficient scopes means the stored token was issued without gmail.readonly.
    // This happens when the Gmail API was not enabled in Google Cloud at the time the
    // user first logged in, or when the user authorized the app before the scope was added.
    // The only fix is to have the user re-authorize so Google issues a new token with the scope.
    const isInsufficientScopes =
      e?.status === 403 ||
      e?.code === 403 ||
      e?.message?.includes('insufficient authentication scopes') ||
      e?.cause?.message?.includes('insufficient authentication scopes')

    if (isInsufficientScopes) {
      return res.status(403).json({
        ok: false,
        error: 'gmail_scope_missing',
        message: 'Gmail permission not granted. Please sign out and sign in again to re-authorize access to your inbox.',
      })
    }

    res.status(500).json({ ok: false, error: e.message })
  }
})

export default router
