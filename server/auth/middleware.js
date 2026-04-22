export function requireAuth(req, res, next) {
  const sid = req.sessionID?.slice(0, 8) || 'none'
  const uid = req.session?.userId || null
  console.log(`[auth] requireAuth ${req.method} ${req.path} | sid=${sid} userId=${uid} cookie=${!!req.headers.cookie}`)
  if (!uid) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  next()
}
