import { Link } from 'react-router-dom'

const TEAM = [
  {
    name: 'Lauren B.',
    role: 'Product Lead & Full-Stack Dev',
    bio: 'Designed and built InboxFlow end-to-end as a capstone for BAIS:3400. Focused on clean UX, Gmail API integration, and deployment on Azure.',
    initials: 'LB',
    color: '#4f6ef7',
  },
]

const VALUES = [
  {
    icon: '🔒',
    title: 'Privacy first',
    body: 'We request only the minimum Gmail permissions needed — read-only metadata. We never read full email bodies, access attachments, or send anything on your behalf.',
  },
  {
    icon: '⚡',
    title: 'Speed over complexity',
    body: 'InboxFlow does one thing well: surface the emails that matter. No AI black boxes, no automated replies — just fast, transparent keyword matching you control.',
  },
  {
    icon: '🎯',
    title: 'You stay in charge',
    body: 'Every folder, filter, and priority rule is created by you. InboxFlow applies your rules — it never makes decisions about your inbox without your explicit input.',
  },
  {
    icon: '🛠️',
    title: 'Built in the open',
    body: 'InboxFlow is a student capstone project, built to real production standards. The stack, decisions, and tradeoffs are documented and available for review.',
  },
]

const STACK = [
  { label: 'Frontend', value: 'React 18 + Vite' },
  { label: 'Backend', value: 'Node.js + Express 5' },
  { label: 'Database', value: 'PostgreSQL via Neon' },
  { label: 'ORM', value: 'Drizzle ORM' },
  { label: 'Auth', value: 'Google OAuth 2.0' },
  { label: 'Gmail', value: 'Gmail API (read-only)' },
  { label: 'Hosting', value: 'Azure App Service' },
  { label: 'Encryption', value: 'AES-256-GCM (token at rest)' },
]

export default function About() {
  return (
    <main>
      {/* Hero */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container narrow" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <h1 className="section-title">About InboxFlow</h1>
          <p className="section-sub" style={{ maxWidth: 600, margin: '0 auto 24px' }}>
            InboxFlow is a capstone project built for BAIS:3400 Digital Product Management.
            It solves a problem nearly every professional faces: critical emails buried under
            noise.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/demo" className="btn btn-primary">Try the demo</Link>
            <Link to="/login" className="btn btn-ghost">Connect Gmail</Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section">
        <div className="container narrow">
          <h2 className="section-title" style={{ fontSize: '1.75rem' }}>Our mission</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.75, color: 'var(--text-muted)' }}>
            Help busy professionals locate critical emails quickly and with minimal effort —
            reducing missed information, delayed responses, and inbox anxiety. InboxFlow
            doesn't replace your email provider. It sits alongside Gmail and gives you a
            smarter view of what actually matters.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="section" style={{ background: 'var(--surface-raised)', paddingTop: 48, paddingBottom: 48 }}>
        <div className="container">
          <h2 className="section-title" style={{ fontSize: '1.75rem' }}>What we believe</h2>
          <div className="grid-2" style={{ marginTop: 32 }}>
            {VALUES.map(v => (
              <div key={v.title} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{v.icon}</span>
                <div>
                  <h4 style={{ margin: '0 0 6px' }}>{v.title}</h4>
                  <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <h2 className="section-title" style={{ fontSize: '1.75rem' }}>The team</h2>
          <p className="section-sub">Built as a solo capstone project.</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            {TEAM.map(m => (
              <div key={m.name} className="card" style={{ maxWidth: 340, textAlign: 'center', padding: 32 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', background: m.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 auto 16px',
                }}>
                  {m.initials}
                </div>
                <h3 style={{ margin: '0 0 4px' }}>{m.name}</h3>
                <p className="muted" style={{ margin: '0 0 12px', fontWeight: 600, fontSize: 13 }}>{m.role}</p>
                <p className="muted" style={{ margin: 0, lineHeight: 1.6, fontSize: 14 }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="section" style={{ background: 'var(--surface-raised)', paddingTop: 48, paddingBottom: 48 }}>
        <div className="container narrow">
          <h2 className="section-title" style={{ fontSize: '1.75rem' }}>Technology stack</h2>
          <p className="section-sub">Built to production standards, not prototype shortcuts.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginTop: 28 }}>
            {STACK.map(s => (
              <div key={s.label} className="card" style={{ padding: '14px 18px' }}>
                <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontWeight: 600 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container narrow" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 12 }}>Ready to try it?</h2>
          <p className="muted" style={{ marginBottom: 24 }}>Connect your Gmail and let InboxFlow sort your inbox in seconds.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary">Get started free</Link>
            <Link to="/contact" className="btn btn-ghost">Get in touch</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
