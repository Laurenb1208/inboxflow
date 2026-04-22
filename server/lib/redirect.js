export function getRedirectUri(req) {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI
  // x-forwarded-host is set by the Vite proxy so we get the real browser-facing host
  const host = req.get('x-forwarded-host') || req.get('host')
  const proto = (req.get('x-forwarded-proto') || req.protocol || 'https').split(',')[0].trim()
  return `${proto}://${host}/api/auth/google/callback`
}

export function getBaseUrl(req) {
  const host = req.get('x-forwarded-host') || req.get('host')
  const proto = (req.get('x-forwarded-proto') || req.protocol || 'https').split(',')[0].trim()
  return `${proto}://${host}`
}
