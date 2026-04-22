import { Link } from 'react-router-dom'

const features = [
  { icon: '📂', title: 'Smart folders', body: 'Automatically organize emails into folders that match how you actually work.' },
  { icon: '🎯', title: 'Custom filters', body: 'Create keyword rules that route messages to the right folder, every time.' },
  { icon: '🚦', title: 'Priority tags', body: 'High, medium, low — see what needs attention before you scroll.' },
  { icon: '🔎', title: 'Find faster', body: 'Surface meeting links, contracts, and action items in seconds.' },
  { icon: '🔔', title: 'Fewer misses', body: 'Reduce missed action items so nothing important slips through.' },
  { icon: '🔌', title: 'Works with Gmail', body: 'Connects to your existing inbox — we never replace your email provider.' },
]

const steps = [
  { n: '01', title: 'Connect your inbox', body: 'Securely connect Gmail. Outlook coming soon.' },
  { n: '02', title: 'Set up folders & filters', body: 'Create custom categories with keyword rules and priorities.' },
  { n: '03', title: 'Stay focused', body: 'Important emails surface to the top. Find what you need in seconds.' },
]

const metrics = [
  { value: '90%+', label: 'of important emails located within 15 seconds' },
  { value: '50%', label: 'reduction in time spent searching emails' },
  { value: '95%', label: 'categorization accuracy target' },
  { value: '40%', label: 'fewer missed or late action items' },
]

export default function Landing() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">For busy professionals</span>
            <h1>Find the email that matters in <span className="accent">seconds</span>, not minutes.</h1>
            <p className="lead">
              InboxFlow keeps important messages organized and easy to retrieve with custom folders,
              keyword filters, and priority levels — so you spend less time digging and more time doing.
            </p>
            <div className="cta-row">
              <Link to="/login" className="btn btn-primary">Get Started</Link>
              <Link to="/demo" className="btn btn-ghost">View Demo →</Link>
            </div>
            <div className="trust-row">
              <span>✓ Connects to Gmail</span>
              <span>✓ No replies sent on your behalf</span>
              <span>✓ Keep your existing inbox</span>
            </div>
          </div>
          <div className="hero-mock">
            <MockInboxCard />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Everything you need to tame your inbox</h2>
          <p className="section-sub">Six core capabilities that work together to surface what matters.</p>
          <div className="grid-3">
            {features.map(f => (
              <div className="card feature" key={f.title}>
                <div className="feat-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="section section-alt">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <p className="section-sub">Three steps from chaos to calm.</p>
          <div className="grid-3">
            {steps.map(s => (
              <div className="card step" key={s.n}>
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="why-grid">
            <div>
              <h2 className="section-title left">Why InboxFlow</h2>
              <p className="section-sub left">
                Email is still the central system for meetings, documents, and requests — but a busy
                inbox buries the messages you need most. InboxFlow gives you a lightweight layer of
                organization on top of Gmail, without changing how you read or send email.
              </p>
              <ul className="checks">
                <li>✓ Keep your existing email provider</li>
                <li>✓ No automatic replies, ever</li>
                <li>✓ Organize by your own rules, not someone else's algorithm</li>
                <li>✓ Built for professionals juggling 40+ emails a day</li>
              </ul>
            </div>
            <div className="metrics">
              <h3 className="metrics-title">Product goals</h3>
              <div className="metrics-grid">
                {metrics.map(m => (
                  <div className="metric" key={m.label}>
                    <div className="metric-value">{m.value}</div>
                    <div className="metric-label">{m.label}</div>
                  </div>
                ))}
              </div>
              <p className="metrics-note">Target outcomes — not yet measured live data.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">What users will say</h2>
          <div className="grid-3">
            <Testimonial quote="I stopped missing meeting links. The priority tags alone are worth it." name="Jordan M." role="Product Manager" />
            <Testimonial quote="Finally an inbox add-on that doesn't try to write my emails for me." name="Priya S." role="Account Executive" />
            <Testimonial quote="I find client contracts in seconds instead of scrolling forever." name="Alex T." role="Operations Lead" />
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container cta-band-inner">
          <div>
            <h2>Ready to clear the noise?</h2>
            <p>Set up your folders, filters, and priorities in under a minute.</p>
          </div>
          <Link to="/settings" className="btn btn-primary btn-lg">Open InboxFlow Settings</Link>
        </div>
      </section>
    </main>
  )
}

function Testimonial({ quote, name, role }) {
  return (
    <div className="card testimonial">
      <p>"{quote}"</p>
      <div className="testimonial-meta">
        <strong>{name}</strong>
        <span>{role}</span>
      </div>
    </div>
  )
}

function MockInboxCard() {
  const rows = [
    { folder: 'Meetings', color: '#3b82f6', subj: 'Zoom link — Q2 sync', from: 'sara@company.com', pr: 'High' },
    { folder: 'Clients', color: '#10b981', subj: 'Updated contract draft', from: 'legal@acme.co', pr: 'Medium' },
    { folder: 'Internal', color: '#8b5cf6', subj: 'FYI: office closure', from: 'hr@company.com', pr: 'Low' },
    { folder: 'Meetings', color: '#3b82f6', subj: 'Calendar invite — kickoff', from: 'lead@partner.io', pr: 'High' },
  ]
  return (
    <div className="mock">
      <div className="mock-head">
        <span className="dot dot-r" /><span className="dot dot-y" /><span className="dot dot-g" />
        <span className="mock-title">InboxFlow · Today</span>
      </div>
      <div className="mock-body">
        {rows.map((r, i) => (
          <div className="mock-row" key={i}>
            <span className="mock-tag" style={{ background: r.color }}>{r.folder}</span>
            <div className="mock-text">
              <div className="mock-subj">{r.subj}</div>
              <div className="mock-from">{r.from}</div>
            </div>
            <span className={`pri-pill pri-${r.pr.toLowerCase()}`}>{r.pr}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
