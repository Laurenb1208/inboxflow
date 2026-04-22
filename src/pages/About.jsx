export default function About() {
  return (
    <main className="section">
      <div className="container narrow">
        <h1 className="section-title left">About InboxFlow</h1>
        <p className="lead">
          InboxFlow was built as the final project for BAIS:3400 Digital Product Management
          to solve a problem nearly every corporate employee faces: important emails getting
          buried in a crowded inbox.
        </p>
        <h3>Our mission</h3>
        <p>
          Help busy professionals consistently locate critical emails quickly and with minimal
          effort, reducing missed information and delays. We don't replace your email provider —
          we sit alongside it.
        </p>
        <h3>What we believe</h3>
        <ul className="checks">
          <li>✓ Your email is yours. We never reply on your behalf.</li>
          <li>✓ Organization should match how you actually work, not the other way around.</li>
          <li>✓ Privacy and least-privilege access matter — we ask for the minimum scope needed.</li>
        </ul>
      </div>
    </main>
  )
}
