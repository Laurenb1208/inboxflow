import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-logo">📬</span>
          <span className="brand-name">InboxFlow</span>
        </Link>
        <nav className="topnav">
          <Link to="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/settings" className={pathname === '/settings' ? 'active' : ''}>Settings</Link>
          <Link to="/settings" className="btn btn-primary btn-sm">Get Started</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/settings" element={<Settings />} />
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
              <a>Features</a><a>How it works</a><a>Pricing</a>
            </div>
            <div>
              <h5>Company</h5>
              <a>About</a><a>Contact</a><a>Privacy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">© 2026 InboxFlow · Prototype</div>
      </footer>
    </div>
  )
}
