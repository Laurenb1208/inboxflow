import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'cookieConsent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== 'true') setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, 'true') } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <p className="cookie-text">
        This website uses cookies to improve your experience and analyze site traffic.{' '}
        <Link to="/cookie-policy" className="cookie-link">Cookie Policy</Link>
      </p>
      <button className="btn btn-primary btn-sm cookie-accept" onClick={accept}>
        Accept
      </button>
    </div>
  )
}
