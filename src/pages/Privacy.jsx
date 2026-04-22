export default function Privacy() {
  return (
    <main className="section">
      <div className="container narrow">
        <h1 className="section-title left">Privacy Policy</h1>
        <p className="lead">
          We follow least-privilege access and store the minimum data needed to organize your inbox.
        </p>

        <h2>What data we collect</h2>
        <ul className="checks">
          <li>✓ <strong>Google account info</strong> — your name, email address, and profile picture, used to sign you in and display your account.</li>
          <li>✓ <strong>Gmail metadata</strong> — sender, subject, timestamp, and labels for your most recent inbox messages.</li>
          <li>✓ <strong>Snippet</strong> — a short ~200-character preview of each message, used for keyword classification.</li>
        </ul>

        <h2>What we do NOT collect</h2>
        <ul className="checks">
          <li>✗ Full email bodies — we never read or store them.</li>
          <li>✗ Attachments — we never access them.</li>
          <li>✗ The ability to send emails — we only request read-only Gmail permission.</li>
        </ul>

        <h2>How we use your data</h2>
        <p>
          Your folder and filter rules are applied to incoming message metadata to organize your inbox
          into folders and priority levels (High, Medium, Low). Aggregated counts are shown on your
          Settings dashboard. We do not sell, share, or use your data for advertising.
        </p>

        <h2>Security</h2>
        <ul className="checks">
          <li>✓ Your Gmail OAuth refresh token is encrypted at rest using AES-256-GCM.</li>
          <li>✓ Your session cookie is signed, HTTP-only, and transmitted over HTTPS.</li>
          <li>✓ All folder, filter, and email data is scoped to your account in our Postgres database.</li>
        </ul>

        <h2>Your control</h2>
        <p>
          You can disconnect InboxFlow from your Google account at any time at your
          {' '}<a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
          Google Account permissions page</a>. Once revoked, InboxFlow can no longer access your Gmail.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? Visit our <a href="/contact">Contact</a> page.
        </p>
      </div>
    </main>
  )
}
