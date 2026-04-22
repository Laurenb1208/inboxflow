import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Settings from './pages/Settings.jsx'
import Login from './pages/Login.jsx'
import Inbox from './pages/Inbox.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Privacy from './pages/Privacy.jsx'
import Pricing from './pages/Pricing.jsx'
import CookiePolicy from './pages/CookiePolicy.jsx'
import Terms from './pages/Terms.jsx'
import CookieBanner from './components/CookieBanner.jsx'
import { useAuth } from './context/Auth.jsx'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="full-loader">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-logo">📬</span>
          <span className="brand-name">InboxFlow</span>
        </Link>
        <nav className="topnav">
          <Link to="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/pricing" className={pathname === '/pricing' ? 'active' : ''}>Pricing</Link>
          <Link to="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>
          {user ? (
            <>
              <Link to="/inbox" className={pathname === '/inbox' ? 'active' : ''}>Inbox</Link>
              <Link to="/settings" className={pathname === '/settings' ? 'active' : ''}>Settings</Link>
              <button className="link-btn nav-user" onClick={logout} title={user.email}>
                {user.picture && <img src={user.picture} alt="" className="avatar" />}
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Get Started</Link>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<Login />} />
        <Route path="/settings" element={<Protected><Settings /></Protected>} />
        <Route path="/inbox" element={<Protected><Inbox /></Protected>} />
      </Routes>

      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="brand">
              <span className="brand-logo">📬</span>
              <span className="brand-name">InboxFlow</span>
            </div>
            <p className="muted">Spend less time searching. Focus on the work that matters.</p>
          </div>
          <div className="foot-cols">
            <div>
              <h5>Product</h5>
              <Link to="/#features">Features</Link>
              <Link to="/#how">How it works</Link>
              <Link to="/pricing">Pricing</Link>
            </div>
            <div>
              <h5>Company</h5>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/privacy">Privacy</Link>
              <Link to="/cookie-policy">Cookie Policy</Link>
              <Link to="/terms">Terms</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">© 2026 InboxFlow · Prototype</div>
      </footer>
      <CookieBanner />
    </div>
  )
}
