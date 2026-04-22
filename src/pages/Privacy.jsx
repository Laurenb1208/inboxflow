export default function Privacy() {
  return (
    <main className="section">
      <div className="container narrow">
        <h1 className="section-title left">Privacy &amp; data handling</h1>
        <p className="lead">
          We follow least-privilege access and store the minimum data needed to organize your inbox.
        </p>

        <h3>What we access</h3>
        <ul className="checks">
          <li>✓ Email metadata (sender, subject, date, labels)</li>
          <li>✓ A short snippet (≈200 chars) used for keyword classification</li>
          <li>✗ Full message bodies — we don't read or store them</li>
          <li>✗ Attachments — we don't access them</li>
        </ul>

        <h3>Where data lives</h3>
        <p>
          Your folder and filter settings, plus message metadata used for sorting, are stored in our
          Postgres database, scoped to your account. Your Gmail OAuth refresh token is encrypted at rest
          using AES-256-GCM.
        </p>

        <h3>What we never do</h3>
        <ul className="checks">
          <li>✓ We never send emails on your behalf</li>
          <li>✓ We never share your email contents with third parties</li>
          <li>✓ We don't run spam or phishing classification</li>
        </ul>

        <h3>Removing your data</h3>
        <p>
          You can revoke InboxFlow's Gmail access at any time at your
          {' '}<a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">Google Account permissions page</a>.
        </p>
      </div>
    </main>
  )
}
