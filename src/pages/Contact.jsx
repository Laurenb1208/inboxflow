import { useState } from 'react'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const submit = e => { e.preventDefault(); setSent(true) }

  return (
    <main className="section">
      <div className="container narrow">
        <h1 className="section-title left">Contact us</h1>
        <p className="lead">Questions, feedback, data requests, or privacy concerns? We'd love to hear from you.</p>

        <div className="contact-email-banner">
          <span>📧</span>
          <span>
            Reach us directly at{' '}
            <a href="mailto:support@inboxflow.app" className="contact-email-link">
              support@inboxflow.app
            </a>
            {' '}— we aim to respond within 2 business days.
          </span>
        </div>

        {sent ? (
          <div className="card" style={{ padding: 24 }}>
            <h3>Thanks, {form.name || 'there'} 👋</h3>
            <p className="muted">We received your message and will get back to you soon.</p>
          </div>
        ) : (
          <form className="card" style={{ padding: 24 }} onSubmit={submit}>
            <label className="field"><span>Name</span>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="field"><span>Email</span>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label className="field"><span>Message</span>
              <textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required
                style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border-strong)', fontFamily: 'inherit', fontSize: 14 }} />
            </label>
            <button className="btn btn-primary" type="submit">Send message</button>
          </form>
        )}
      </div>
    </main>
  )
}
