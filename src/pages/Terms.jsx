export default function Terms() {
  return (
    <main className="section">
      <div className="container narrow">
        <h1 className="section-title left">Terms &amp; Conditions</h1>
        <p className="lead">
          These terms govern your use of InboxFlow. By signing in, you agree to the terms below.
        </p>

        <h2>1. Description of service</h2>
        <p>
          InboxFlow is an email organization tool that connects to your Gmail account, reads message
          metadata, and sorts incoming emails into folders and priority levels based on keyword rules
          you define. InboxFlow does not replace your email provider — it sits alongside Gmail.
        </p>

        <h2>2. User responsibilities</h2>
        <ul className="checks">
          <li>✓ You must own or be authorized to access the Gmail account you connect.</li>
          <li>✓ You are responsible for the folder names, filter keywords, and rules you create.</li>
          <li>✓ You agree not to attempt to misuse, reverse-engineer, or disrupt the service.</li>
        </ul>

        <h2>3. No guarantee of accuracy</h2>
        <p>
          Email classification is performed by simple keyword matching against subject, sender, and
          snippet. Results may be incorrect or incomplete. InboxFlow is provided <strong>"as is"</strong>
          without warranty of any kind. You should not rely on InboxFlow as your sole means of
          tracking important communications.
        </p>

        <h2>4. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, InboxFlow and its authors are not liable for any
          indirect, incidental, or consequential damages arising from your use of the service,
          including missed emails, lost opportunities, or data loss.
        </p>

        <h2>5. Third-party services</h2>
        <p>
          InboxFlow uses the Google Gmail API to read message metadata. Your use of Google services
          is governed by Google's own terms and privacy policy. Revoking InboxFlow's access at
          {' '}<a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
          your Google Account permissions page</a> will immediately stop further data access.
        </p>

        <h2>6. Changes to these terms</h2>
        <p>
          We may update these terms from time to time. Material changes will be reflected on this
          page with an updated effective date. Continued use of the service after changes are posted
          constitutes acceptance of the revised terms.
        </p>

        <h2>7. Contact</h2>
        <p>
          Questions about these terms? Visit our <a href="/contact">Contact</a> page.
        </p>
      </div>
    </main>
  )
}
