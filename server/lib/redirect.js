export function getRedirectUri(req) {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI
  const host = req.get('host')
  const proto = (req.get('x-forwarded-proto') || req.protocol || 'https').split(',')[0]
  return `${proto}://${host}/api/auth/google/callback`
}

export function getBaseUrl(req) {
  const host = req.get('host')
  const proto = (req.get('x-forwarded-proto') || req.protocol || 'https').split(',')[0]
  return `${proto}://${host}`
}
