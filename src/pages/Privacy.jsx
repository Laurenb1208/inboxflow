export default function Privacy() {
  return (
    <main className="section">
      <div className="container narrow">
        <h1 className="section-title left">Privacy Policy</h1>
        <p className="muted" style={{ marginBottom: 8 }}>
          <strong>Effective date:</strong> April 22, 2026 &nbsp;·&nbsp;
          <strong>App:</strong> InboxFlow &nbsp;·&nbsp;
          <strong>Homepage:</strong> <a href="/">inboxflow.app</a>
        </p>
        <p className="lead">
          InboxFlow follows a least-privilege approach: we request only the minimum permissions
          needed to organize your inbox, and we never access or store what we don't need.
        </p>

        <h2>1. What data we collect</h2>
        <ul className="checks">
          <li>✓ <strong>Google account info</strong> — your name, email address, and profile picture, used to sign you in and display your account.</li>
          <li>✓ <strong>Gmail message metadata</strong> — sender address, subject line, timestamp, and Gmail labels for up to 100 of your most recent inbox messages per sync.</li>
          <li>✓ <strong>Email snippet</strong> — a short (~200-character) preview of each message body, used for keyword-based classification only.</li>
          <li>✓ <strong>OAuth refresh token</strong> — encrypted at rest using AES-256-GCM so InboxFlow can re-authenticate on your behalf when you manually trigger a sync.</li>
        </ul>

        <h2>2. What we do NOT collect</h2>
        <ul className="checks">
          <li>✗ <strong>Full email bodies</strong> — we never read or store the complete text of your messages.</li>
          <li>✗ <strong>Attachments</strong> — we never access or download any files attached to your emails.</li>
          <li>✗ <strong>Sent mail or drafts</strong> — we only read your inbox (INBOX label).</li>
          <li>✗ <strong>Send, modify, or delete capability</strong> — we only request read-only Gmail permission and cannot alter your Gmail in any way.</li>
          <li>✗ <strong>Third-party data sharing</strong> — we never sell, share, or transfer your data to any third party for advertising or commercial purposes.</li>
        </ul>

        <h2>3. Google API Limited Use Disclosure</h2>
        <p>
          InboxFlow's use of data received from Google APIs conforms to the{' '}
          <a href="https://developers.google.com/terms/api-services-user-data-policy"
             target="_blank" rel="noreferrer">
            Google API Services User Data Policy
          </a>, including the Limited Use requirements.
          Specifically:
        </p>
        <ul className="checks">
          <li>✓ We only use Gmail data to provide and improve the email organization features described in this policy.</li>
          <li>✓ We do not use Gmail data to develop, improve, or train any generalized AI or machine learning models.</li>
          <li>✓ We do not transfer Gmail data to third parties except as necessary to provide the service (e.g., our Postgres database provider).</li>
          <li>✓ We do not use Gmail data for advertising or allow humans to read your Gmail data except with your explicit permission or for security/legal obligations.</li>
        </ul>

        <h2>4. How we use your data</h2>
        <p>
          Your folder and filter rules are applied to incoming message metadata to organize your inbox
          into folders and priority levels (High, Medium, Low). Aggregated counts are shown on your
          Settings dashboard. No data is used for any purpose other than providing and improving this
          service to you.
        </p>

        <h2>5. Data retention</h2>
        <p>
          Email metadata and snippets synced from Gmail are stored in our database and associated with
          your account. You can request deletion of your account and all associated data at any time by
          contacting us at the email below. We will process deletion requests within 30 days.
        </p>

        <h2>6. Security</h2>
        <ul className="checks">
          <li>✓ Your Gmail OAuth refresh token is encrypted at rest using AES-256-GCM before being stored.</li>
          <li>✓ Your session cookie is signed, HTTP-only, and transmitted over HTTPS only.</li>
          <li>✓ All folder, filter, and email data is scoped to your account in our database.</li>
          <li>✓ No credentials or tokens are ever logged or exposed in frontend code.</li>
        </ul>

        <h2>7. Your control</h2>
        <p>
          You can revoke InboxFlow's access to your Gmail account at any time via your{' '}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
            Google Account permissions page
          </a>. Once revoked, InboxFlow can no longer access your Gmail data. You may also request
          that we delete your stored data by contacting us.
        </p>

        <h2>8. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be reflected on
          this page with an updated effective date. Continued use of the service after changes are
          posted constitutes your acceptance of the revised policy.
        </p>

        <h2>9. Contact</h2>
        <p>
          Questions, data requests, or concerns about this privacy policy?<br />
          Email us at: <a href="mailto:support@inboxflow.app">support@inboxflow.app</a><br />
          Or visit our <a href="/contact">Contact page</a>.
        </p>
      </div>
    </main>
  )
}
