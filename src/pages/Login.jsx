import { useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/Auth.jsx'

export default function Login() {
  const { user, loading } = useAuth()
  const [params] = useSearchParams()
  const error = params.get('error')

  useEffect(() => { document.title = 'Sign in · InboxFlow' }, [])
  if (loading) return <div className="full-loader">Loading…</div>
  if (user) return <Navigate to="/settings" replace />

  return (
    <main className="login-page">
      <div className="login-card card">
        <div className="brand brand-lg">
          <span className="brand-logo">📬</span>
          <span className="brand-name">InboxFlow</span>
        </div>
        <h1>Sign in to continue</h1>
        <p className="muted">Connect your Gmail account to start organizing your inbox.</p>

        {error && <div className="error">Sign-in failed: {decodeURIComponent(error)}</div>}

        <a href="/api/auth/google" className="btn btn-google btn-block">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8a12 12 0 1 1 0-24c3 0 5.7 1.1 7.8 3l5.7-5.7A20 20 0 1 0 24 44c11 0 20-8 20-20 0-1.3-.1-2.3-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.4 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.8-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.3 39.6 16.1 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6.2 5.2c-.4.4 6.5-4.7 6.5-14.5 0-1.3-.1-2.3-.4-3.5z"/>
          </svg>
          Sign in with Google
        </a>

        <div className="permission-box">
          <div className="perm-title">🔒 What InboxFlow accesses</div>
          <ul className="perm-list">
            <li>
              <span className="perm-yes">✓</span>
              <span><strong>Your name, email, and profile picture</strong> — to identify your account</span>
            </li>
            <li>
              <span className="perm-yes">✓</span>
              <span><strong>Gmail inbox metadata</strong> — sender, subject, date, and a short snippet (~200 chars) of up to 100 messages, used to apply your folder and filter rules</span>
            </li>
          </ul>
          <div className="perm-title perm-no-title">✗ What InboxFlow never accesses</div>
          <ul className="perm-list">
            <li><span className="perm-no">✗</span><span>Full email body text or attachments</span></li>
            <li><span className="perm-no">✗</span><span>Sent mail, drafts, or any folder other than Inbox</span></li>
            <li><span className="perm-no">✗</span><span>Ability to send, reply, or modify any email</span></li>
            <li><span className="perm-no">✗</span><span>Your data is never sold or shared with third parties</span></li>
          </ul>
          <p className="perm-footer">
            By signing in you agree to our{' '}
            <Link to="/terms">Terms</Link> and{' '}
            <Link to="/privacy">Privacy Policy</Link>.
            You can revoke access anytime from your{' '}
            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
              Google Account settings
            </a>.
          </p>
        </div>
      </div>
    </main>
  )
}
