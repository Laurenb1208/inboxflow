export default function CookiePolicy() {
  return (
    <main className="section">
      <div className="container narrow">
        <h1 className="section-title left">Cookie Policy</h1>
        <p className="lead">
          This page explains how InboxFlow uses cookies and similar technologies when you visit our site.
        </p>

        <h3>What are cookies?</h3>
        <p>
          Cookies are small text files stored on your device by your browser. They help websites remember
          information about your visit, such as preferences and sign-in state.
        </p>

        <h3>How we use cookies</h3>
        <ul className="checks">
          <li>✓ <strong>Essential</strong> — a session cookie keeps you signed in after you connect Gmail.</li>
          <li>✓ <strong>Preferences</strong> — we use <code>localStorage</code> to remember that you've accepted this notice so we don't show it again.</li>
          <li>✓ <strong>Analytics</strong> — we may use aggregated, anonymized analytics to understand how the site is used.</li>
        </ul>

        <h3>Managing cookies</h3>
        <p>
          You can clear cookies and site data at any time from your browser settings. Doing so will sign you
          out and reset your consent choice.
        </p>

        <h3>Contact</h3>
        <p>
          Questions about this policy? Visit our <a href="/contact">Contact</a> page.
        </p>
      </div>
    </main>
  )
}
