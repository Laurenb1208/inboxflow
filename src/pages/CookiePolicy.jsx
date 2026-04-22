export default function CookiePolicy() {
  return (
    <main className="section">
      <div className="container narrow">
        <h1 className="section-title left">Cookie Policy</h1>
        <p className="lead">
          This page explains how InboxFlow uses cookies and similar technologies when you visit our site.
        </p>

        <h2>What are cookies?</h2>
        <p>
          Cookies are small text files stored on your device by your browser. They help websites remember
          information about your visit, such as preferences and sign-in state. Some sites also use
          related browser storage like <code>localStorage</code> for similar purposes.
        </p>

        <h2>How InboxFlow uses cookies</h2>
        <ul className="checks">
          <li>✓ <strong>Essential cookies</strong> — a signed session cookie keeps you logged in after you connect Gmail. Without it, the app cannot function.</li>
          <li>✓ <strong>Preference cookies</strong> — we save your cookie-consent choice in <code>localStorage</code> (<code>cookieConsent</code>) so we don't show the banner on every visit.</li>
          <li>✓ <strong>Analytics cookies</strong> — we may use Google Analytics to collect anonymized, aggregated usage data (e.g., which pages are visited) to understand how the site is used.</li>
        </ul>

        <h2>How you can control cookies</h2>
        <p>
          You can clear cookies and site data at any time from your browser settings. Doing so will
          sign you out of InboxFlow and reset your consent choice. You can also block third-party
          cookies in your browser to opt out of analytics.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? Visit our <a href="/contact">Contact</a> page.
        </p>
      </div>
    </main>
  )
}
