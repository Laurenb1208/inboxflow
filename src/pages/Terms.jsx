export default function Terms() {
  return (
    <main className="section">
      <div className="container narrow">
        <h1 className="section-title left">Terms &amp; Conditions</h1>
        <p className="muted" style={{ marginBottom: 8 }}>
          <strong>Effective date:</strong> April 22, 2026 &nbsp;·&nbsp;
          <strong>App:</strong> InboxFlow &nbsp;·&nbsp;
          <strong>Homepage:</strong> <a href="/">inboxflow.app</a>
        </p>
        <p className="lead">
          These terms govern your use of InboxFlow. By signing in or using this service, you agree
          to the terms below. Please read them carefully.
        </p>

        <h2>1. Description of service</h2>
        <p>
          InboxFlow is an email organization tool that connects to your Gmail account, reads message
          metadata (sender, subject, snippet, timestamp), and sorts incoming emails into folders and
          priority levels based on keyword rules you define. InboxFlow does not replace your email
          provider — it operates alongside Gmail and does not send, modify, or delete any messages.
        </p>

        <h2>2. Google OAuth and permissions</h2>
        <p>
          InboxFlow uses Google OAuth 2.0 to authenticate you and requests the following permissions:
        </p>
        <ul className="checks">
          <li>✓ <strong>openid, email, profile</strong> — to identify you, display your name and avatar, and associate your data with your account.</li>
          <li>✓ <strong>gmail.readonly</strong> — to read your inbox message metadata and snippets for the purpose of organization. We cannot send, modify, or delete email.</li>
        </ul>
        <p>
          You may revoke these permissions at any time via your{' '}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
            Google Account permissions page
          </a>. Revoking access immediately prevents InboxFlow from fetching further Gmail data.
        </p>

        <h2>3. User responsibilities</h2>
        <ul className="checks">
          <li>✓ You must own or be authorized to access the Gmail account you connect.</li>
          <li>✓ You are responsible for the folder names, filter keywords, and rules you create.</li>
          <li>✓ You agree not to attempt to misuse, reverse-engineer, or disrupt the service.</li>
          <li>✓ You agree not to use InboxFlow in violation of any applicable laws or Google's own Terms of Service.</li>
        </ul>

        <h2>4. No guarantee of accuracy</h2>
        <p>
          Email classification is performed by simple keyword matching against subject, sender, and
          snippet. Results may be incorrect or incomplete. InboxFlow is provided <strong>"as is"</strong>
          without warranty of any kind. You should not rely on InboxFlow as your sole means of
          tracking important communications.
        </p>

        <h2>5. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, InboxFlow and its authors are not liable for any
          indirect, incidental, or consequential damages arising from your use of the service,
          including missed emails, lost opportunities, or data loss.
        </p>

        <h2>6. Third-party services</h2>
        <p>
          InboxFlow uses the Google Gmail API to read message metadata. Your use of Google services
          is governed by{' '}
          <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">
            Google's Terms of Service
          </a>{' '}
          and{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
            Privacy Policy
          </a>. Revoking InboxFlow's access stops all further Gmail data access immediately.
        </p>

        <h2>7. Data and privacy</h2>
        <p>
          Your use of InboxFlow is also governed by our{' '}
          <a href="/privacy">Privacy Policy</a>, which explains what data we collect, how we use it,
          and your rights regarding that data. Our use of Gmail data complies with the{' '}
          <a href="https://developers.google.com/terms/api-services-user-data-policy"
             target="_blank" rel="noreferrer">
            Google API Services User Data Policy
          </a>.
        </p>

        <h2>8. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. Material changes will be reflected on this
          page with an updated effective date. Continued use of the service after changes are posted
          constitutes acceptance of the revised terms.
        </p>

        <h2>9. Contact</h2>
        <p>
          Questions about these terms?<br />
          Email us at: <a href="mailto:support@inboxflow.app">support@inboxflow.app</a><br />
          Or visit our <a href="/contact">Contact page</a>.
        </p>
      </div>
    </main>
  )
}
