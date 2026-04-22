import { Link } from 'react-router-dom'

const tiers = [
  { name: 'Free', price: '$0', tagline: 'Great for trying it out',
    features: ['1 Gmail account', 'Up to 3 folders', 'Basic filters', 'Manual sync'] },
  { name: 'Pro', price: '$8', period: '/mo', tagline: 'For busy professionals', highlight: true,
    features: ['1 Gmail account', 'Unlimited folders & filters', 'Auto sorting', 'Priority email support'] },
  { name: 'Team', price: '$24', period: '/seat/mo', tagline: 'For small teams',
    features: ['Everything in Pro', 'Shared folder templates', 'Admin dashboard', 'SSO (coming soon)'] },
]

export default function Pricing() {
  return (
    <main className="section">
      <div className="container">
        <h1 className="section-title">Simple pricing</h1>
        <p className="section-sub">Start free. Upgrade when you need more.</p>
        <div className="grid-3">
          {tiers.map(t => (
            <div key={t.name} className={`card pricing-card ${t.highlight ? 'highlight' : ''}`}>
              {t.highlight && <div className="pop">Most popular</div>}
              <h3>{t.name}</h3>
              <div className="price"><span className="big">{t.price}</span>{t.period && <span className="muted"> {t.period}</span>}</div>
              <p className="muted">{t.tagline}</p>
              <ul className="checks">{t.features.map(f => <li key={f}>✓ {f}</li>)}</ul>
              <Link to="/login" className={`btn ${t.highlight ? 'btn-primary' : 'btn-ghost'} btn-block`}>Get started</Link>
            </div>
          ))}
        </div>
        <p className="section-sub" style={{ marginTop: 32 }}>This is a student prototype — no payments are processed.</p>
      </div>
    </main>
  )
}
