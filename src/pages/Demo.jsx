import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import FolderModal from '../components/FolderModal.jsx'
import Toast from '../components/Toast.jsx'
import { COLORS } from '../data/defaults.js'

// ─── Sample emails: 6 folders × 3 priorities + uncategorized ───────────────
const SAMPLE_EMAILS = [
  // MEETINGS — keywords: zoom, calendar, meeting, reschedule, standup
  { id: 'e1',  priority: 'High',   fromName: 'Sara Johnson',        fromAddr: 'sara@company.com',            subject: 'Zoom link — Q2 planning sync',                     snippet: 'Here is the Zoom link for our Q2 planning call tomorrow at 2 PM. Please join 5 min early.',                        receivedAt: '2026-04-22T14:00:00Z' },
  { id: 'e2',  priority: 'High',   fromName: 'Marcus Lee',          fromAddr: 'lead@partner.io',             subject: 'Calendar invite: project kickoff',                 snippet: 'Sending over a calendar invite for the project kickoff meeting next Monday at 10 AM.',                             receivedAt: '2026-04-22T11:00:00Z' },
  { id: 'e4',  priority: 'High',   fromName: 'Amanda Chen',         fromAddr: 'amanda@company.com',          subject: 'Meeting invite: product roadmap review',           snippet: 'Please accept this meeting invite for the product roadmap review on Friday at 1 PM.',                              receivedAt: '2026-04-21T16:00:00Z' },
  { id: 'e3',  priority: 'Medium', fromName: 'Jamie Torres',        fromAddr: 'jamie@company.com',           subject: 'Zoom standup notes — Apr 22',                      snippet: "Notes from today's standup are attached. Action items highlighted. Next meeting is Thursday.",                      receivedAt: '2026-04-22T09:30:00Z' },
  { id: 'e9',  priority: 'Medium', fromName: 'Ben Walker',          fromAddr: 'ben@agency.com',              subject: 'Zoom link for design review this Friday',          snippet: "I'll send the Zoom link for the design review call. Can you confirm Friday at 11 AM still works?",                  receivedAt: '2026-04-18T13:00:00Z' },
  { id: 'e6',  priority: 'Low',    fromName: 'Operations Team',     fromAddr: 'ops@company.com',             subject: 'All-hands meeting tomorrow at 3 PM',               snippet: 'Reminder: all-hands meeting is tomorrow at 3 PM in the main conference room. Zoom link in calendar.',               receivedAt: '2026-04-21T10:00:00Z' },

  // CLIENTS — keywords: contract, proposal, deliverable, follow-up
  { id: 'e11', priority: 'High',   fromName: 'Legal @ Acme',        fromAddr: 'legal@acme.co',               subject: 'Updated contract draft for review',                snippet: 'Please review the attached contract draft and let us know if you have any revisions before signing.',                receivedAt: '2026-04-22T13:30:00Z' },
  { id: 'e13', priority: 'High',   fromName: 'Client Success',      fromAddr: 'cs@bigclient.com',            subject: 'Contract renewal — can we schedule a call?',       snippet: "Our contract is up for renewal next month. I'd love to schedule a call to discuss terms this week.",                receivedAt: '2026-04-21T15:00:00Z' },
  { id: 'e17', priority: 'High',   fromName: 'Meridian Partners',   fromAddr: 'hello@meridian.io',           subject: "Proposal feedback — ready to move forward",        snippet: "We've reviewed your proposal and are ready to move forward. Can we get a revised contract by Friday?",             receivedAt: '2026-04-19T16:00:00Z' },
  { id: 'e12', priority: 'Medium', fromName: 'TechCorp Sales',      fromAddr: 'sales@techcorp.com',          subject: 'New proposal for your review',                     snippet: 'Attached is the revised proposal with updated pricing. Let us know your availability to discuss.',                  receivedAt: '2026-04-22T09:00:00Z' },
  { id: 'e16', priority: 'Medium', fromName: 'Zoe Hammond',         fromAddr: 'zoe@partnerco.com',           subject: 'Follow-up: expansion discussion',                  snippet: 'Following up on our call last week regarding the potential expansion into the EU market. Let me know.',              receivedAt: '2026-04-20T11:30:00Z' },
  { id: 'e44', priority: 'Low',    fromName: 'Bloom Agency',        fromAddr: 'projects@bloomagency.co',     subject: 'Final deliverable: brand refresh assets',          snippet: 'All deliverables for the brand refresh project are now complete and uploaded to the shared drive. Please review.',    receivedAt: '2026-04-13T11:30:00Z' },

  // ORDERS & DELIVERIES — keywords: order, shipped, package, delivery, tracking
  { id: 'e61', priority: 'High',   fromName: 'ShopDirect',          fromAddr: 'alerts@shopdirect.com',       subject: 'Order #7821 — item out of stock, action required', snippet: 'One item in your order (#7821) is out of stock. Please select a replacement or we will issue a refund.',             receivedAt: '2026-04-22T08:30:00Z' },
  { id: 'e29', priority: 'Medium', fromName: 'Amazon',              fromAddr: 'ship-confirm@amazon.com',     subject: 'Your order has shipped — arrives tomorrow',        snippet: 'Good news! Your order of "Mechanical Keyboard Pro" has shipped and arrives tomorrow by 8 PM.',                       receivedAt: '2026-04-22T08:00:00Z' },
  { id: 'e62', priority: 'Medium', fromName: 'FedEx',               fromAddr: 'tracking@fedex.com',          subject: 'Package out for delivery today',                   snippet: 'Your package (tracking #724891022) is out for delivery today and will arrive by 8 PM. No signature required.',       receivedAt: '2026-04-21T07:00:00Z' },
  { id: 'e63', priority: 'Low',    fromName: 'UPS',                 fromAddr: 'notify@ups.com',              subject: 'Delivery tracking update: order in transit',       snippet: 'Your delivery is on its way. Tracking shows the package is in transit and expected to arrive in 3-5 business days.', receivedAt: '2026-04-20T06:00:00Z' },

  // FINANCE — keywords: invoice, payout, payment, bank, statement
  { id: 'e45', priority: 'High',   fromName: 'Nexus Procurement',   fromAddr: 'ap@nexuscorp.com',            subject: 'Invoice #2209 overdue — please advise',            snippet: 'Our records show Invoice #2209 ($6,500) is 15 days past due. Please confirm payment status or let us know if there is an issue.', receivedAt: '2026-04-11T09:00:00Z' },
  { id: 'e14', priority: 'Medium', fromName: 'GlobalVentures',      fromAddr: 'billing@globalv.com',         subject: 'Invoice #4421 attached for approval',              snippet: 'Please find Invoice #4421 for Q1 services attached. Kindly approve for payment within 14 days.',                   receivedAt: '2026-04-21T11:00:00Z' },
  { id: 'e33', priority: 'Medium', fromName: 'Stripe',              fromAddr: 'reports@stripe.com',          subject: 'Weekly payout summary — Apr 14–21',                snippet: 'Your weekly payout of $1,240.00 has been sent to your bank account. View the full breakdown in your dashboard.',       receivedAt: '2026-04-20T07:00:00Z' },
  { id: 'e20', priority: 'Low',    fromName: 'ClientCo Billing',    fromAddr: 'billing@clientco.com',        subject: 'Invoice #887 — please review',                     snippet: 'Your invoice #887 is ready. Total due: $4,200. Please review and let us know if you have any questions.',             receivedAt: '2026-04-16T09:00:00Z' },

  // SCHOOL — keywords: assignment, course, certificate, class, grade
  { id: 'e64', priority: 'High',   fromName: 'Prof. Williams',      fromAddr: 'prof.w@university.edu',       subject: 'Assignment due tomorrow — no extensions',          snippet: 'Just a reminder that your final assignment is due tomorrow at 11:59 PM. No extensions will be granted. Good luck!',   receivedAt: '2026-04-22T09:00:00Z' },
  { id: 'e65', priority: 'Medium', fromName: 'LMS System',          fromAddr: 'noreply@canvas.edu',          subject: 'New course materials posted for Week 10',          snippet: 'Your professor has uploaded new course materials for Week 10. Log in to review the reading list and lecture slides.',   receivedAt: '2026-04-20T10:00:00Z' },
  { id: 'e57', priority: 'Low',    fromName: 'Coursera',            fromAddr: 'no-reply@coursera.org',       subject: 'Your certificate is ready to download',            snippet: 'Congratulations! You have earned your certificate for "Data Analysis with Python." Download and share it on LinkedIn.',   receivedAt: '2026-04-12T14:00:00Z' },

  // PERSONAL — keywords: flight, reservation, vacation, trip, birthday
  { id: 'e66', priority: 'High',   fromName: 'United Airlines',     fromAddr: 'notifications@united.com',    subject: 'Flight cancellation — rebooking required',         snippet: 'Your flight UA2284 on April 28 has been cancelled. Please rebook immediately or contact us for a refund.',             receivedAt: '2026-04-22T07:00:00Z' },
  { id: 'e56', priority: 'Medium', fromName: 'Airbnb',              fromAddr: 'automated@airbnb.com',        subject: 'Your reservation is confirmed — San Francisco',    snippet: 'Your stay at "Bright Studio Near Union Square" from May 6–9 is confirmed. Check-in instructions will arrive 48h before.', receivedAt: '2026-04-14T09:00:00Z' },
  { id: 'e35', priority: 'Low',    fromName: 'Flight Confirm',      fromAddr: 'confirm@flightapp.com',       subject: 'Flight confirmation: ORD → JFK Apr 28',            snippet: "Your flight UA2284 from Chicago O'Hare to New York JFK on April 28 at 7:15 AM is confirmed. Check in opens 24h before.",  receivedAt: '2026-04-18T15:00:00Z' },

  // UNCATEGORIZED — no keyword match
  { id: 'e30', priority: null, fromName: 'GitHub',             fromAddr: 'noreply@github.com',       subject: 'Security alert on your repository',              snippet: 'A dependency in your repository has a known vulnerability. Review the Dependabot alert and apply the fix.',            receivedAt: '2026-04-22T07:30:00Z' },
  { id: 'e31', priority: null, fromName: 'Weekly Digest',      fromAddr: 'news@techdigest.com',      subject: 'Your weekly industry digest',                    snippet: 'This week in tech: AI tools, remote work trends, SaaS funding rounds, and the top reads from the community.',           receivedAt: '2026-04-21T08:00:00Z' },
  { id: 'e32', priority: null, fromName: 'LinkedIn',           fromAddr: 'messaging@linkedin.com',   subject: '3 new connections are looking at you',           snippet: 'You have 3 new profile views and 2 pending connection requests. Log in to see who wants to connect.',                   receivedAt: '2026-04-20T16:00:00Z' },
  { id: 'e34', priority: null, fromName: 'DocuSign',           fromAddr: 'dse@docusign.net',          subject: 'Please sign: NDA for vendor onboarding',         snippet: 'You have been sent a document to sign: "Mutual NDA — Vendor Onboarding". Click to review and sign securely.',            receivedAt: '2026-04-19T14:00:00Z' },
  { id: 'e36', priority: null, fromName: 'Webinar Host',       fromAddr: 'events@saasconf.com',      subject: "You're registered: Growth Hacking 2026",         snippet: "You're confirmed for \"Growth Hacking in 2026\" on May 3 at 11 AM ET. A recording will be sent automatically.",          receivedAt: '2026-04-17T12:00:00Z' },
  { id: 'e54', priority: null, fromName: 'Notion',             fromAddr: 'notify@notion.so',         subject: 'Someone shared a page with you',                 snippet: 'Jordan Rivera shared "2026 Company Wiki" with you. Click to open the page and start reading.',                           receivedAt: '2026-04-16T16:00:00Z' },
  { id: 'e55', priority: null, fromName: 'Figma',              fromAddr: 'noreply@figma.com',        subject: 'New comment on "Dashboard v4"',                  snippet: 'Alex left a comment on your design file: "Can we try a darker shade on the sidebar?" Click to reply.',                   receivedAt: '2026-04-15T11:00:00Z' },
  { id: 'e58', priority: null, fromName: 'Dropbox',            fromAddr: 'no-reply@dropbox.com',     subject: 'New shared folder: Q1 Assets',                   snippet: 'Morgan shared the folder "Q1 Assets" with you. You can now view and edit the files inside. Open in Dropbox.',             receivedAt: '2026-04-11T10:30:00Z' },
]

const INIT_FOLDERS = [
  { id: 'f1', name: 'Meetings',            color: 'Blue',   keywords: 'zoom, calendar, meeting, reschedule, standup' },
  { id: 'f2', name: 'Clients',             color: 'Green',  keywords: 'contract, proposal, deliverable, follow-up' },
  { id: 'f3', name: 'Orders & Deliveries', color: 'Orange', keywords: 'order, shipped, package, delivery, tracking' },
  { id: 'f4', name: 'Finance',             color: 'Teal',   keywords: 'invoice, payout, payment, bank, statement' },
  { id: 'f5', name: 'School',              color: 'Pink',   keywords: 'assignment, course, certificate, class, grade' },
  { id: 'f6', name: 'Personal',            color: 'Red',    keywords: 'flight, reservation, vacation, trip, birthday' },
]

function classify(email, folders) {
  const hay = [email.subject, email.snippet, email.fromAddr, email.fromName].join(' ').toLowerCase()
  for (const folder of folders) {
    const hit = (folder.keywords || '').split(',').map(k => k.trim().toLowerCase()).filter(Boolean).some(k => hay.includes(k))
    if (hit) return { folderId: folder.id, folderName: folder.name, folderColor: folder.color }
  }
  return { folderId: null, folderName: null, folderColor: null }
}

function colorHex(name) { return COLORS.find(c => c.name === name)?.hex || '#9ca3af' }
function fmtDate(iso) {
  const d = new Date(iso)
  const today = new Date(); today.setHours(0,0,0,0)
  const dd = new Date(d); dd.setHours(0,0,0,0)
  if (dd.getTime() === today.getTime()) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

let nextId = 100
const uid = () => String(++nextId)

export default function Demo() {
  const [folders, setFolders] = useState(INIT_FOLDERS)
  const [folderModal, setFolderModal] = useState({ open: false, initial: null })
  const [toast, setToast] = useState('')
  const [activeFolderId, setActiveFolderId] = useState('')
  const [activePriority, setActivePriority] = useState('')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('inbox')

  const emails = useMemo(() => SAMPLE_EMAILS.map(e => ({ ...e, ...classify(e, folders) })), [folders])

  const visible = useMemo(() => emails.filter(e => {
    if (activeFolderId === 'uncategorized' && e.folderId) return false
    if (activeFolderId && activeFolderId !== 'uncategorized' && e.folderId !== activeFolderId) return false
    if (activePriority && e.priority !== activePriority) return false
    if (q) {
      const hay = [e.subject, e.snippet, e.fromName, e.fromAddr].join(' ').toLowerCase()
      if (!hay.includes(q.toLowerCase())) return false
    }
    return true
  }), [emails, activeFolderId, activePriority, q])

  const activeLabel = useMemo(() => {
    const parts = []
    if (activeFolderId === 'uncategorized') parts.push('Uncategorized')
    else if (activeFolderId) parts.push(folders.find(f => f.id === activeFolderId)?.name || '')
    if (activePriority) parts.push(activePriority)
    return parts.join(' + ')
  }, [activeFolderId, activePriority, folders])

  const saveFolder = (data) => {
    if (data.id) {
      setFolders(fs => fs.map(f => f.id === data.id ? { ...f, ...data } : f))
      setToast('Folder updated')
    } else {
      const exists = folders.some(f => f.name.toLowerCase() === data.name.toLowerCase())
      if (exists) { setToast('A folder with that name already exists'); return }
      setFolders(fs => [...fs, { ...data, id: uid() }])
      setToast('Folder created')
    }
  }

  const deleteFolder = (id) => {
    setFolders(fs => fs.filter(f => f.id !== id))
    if (activeFolderId === id) setActiveFolderId('')
    setToast('Folder deleted')
  }

  const categorized = emails.filter(e => e.folderId).length

  return (
    <main className="demo-page">
      <div className="demo-banner">
        <span>🎮 <strong>Interactive Demo</strong> — sample data only. No real emails.</span>
        <Link to="/login" className="btn btn-primary btn-sm">Connect your Gmail →</Link>
      </div>

      <div className="container demo-layout">
        {/* LEFT: sidebar */}
        <aside className="demo-side card">
          <div className="demo-stats">
            <div className="ds"><span className="ds-val">{emails.length}</span><span className="ds-lbl">Emails</span></div>
            <div className="ds"><span className="ds-val">{categorized}</span><span className="ds-lbl">Sorted</span></div>
            <div className="ds"><span className="ds-val">{folders.length}</span><span className="ds-lbl">Folders</span></div>
          </div>

          <div className="demo-tabs">
            <button className={`dtab ${tab === 'inbox' ? 'on' : ''}`} onClick={() => setTab('inbox')}>📥 Inbox</button>
            <button className={`dtab ${tab === 'manage' ? 'on' : ''}`} onClick={() => setTab('manage')}>⚙️ Folders</button>
          </div>

          {tab === 'inbox' && <>
            <h4 className="side-heading">Folders</h4>
            <button className={`side-item ${activeFolderId === '' ? 'on' : ''}`} onClick={() => setActiveFolderId('')}>All emails</button>
            {folders.map(f => (
              <button key={f.id} className={`side-item ${activeFolderId === f.id ? 'on' : ''}`} onClick={() => setActiveFolderId(cur => cur === f.id ? '' : f.id)}>
                <span className="color-dot" style={{ background: colorHex(f.color) }} /> {f.name}
              </button>
            ))}
            <button className={`side-item ${activeFolderId === 'uncategorized' ? 'on' : ''}`} onClick={() => setActiveFolderId(cur => cur === 'uncategorized' ? '' : 'uncategorized')}>Uncategorized</button>

            <h4 className="side-heading">Priority</h4>
            <button className={`side-item ${activePriority === '' ? 'on' : ''}`} onClick={() => setActivePriority('')}>All priorities</button>
            {['High', 'Medium', 'Low'].map(p => (
              <button key={p} className={`side-item ${activePriority === p ? 'on' : ''}`} onClick={() => setActivePriority(cur => cur === p ? '' : p)}>
                <span className={`r-dot pri-${p.toLowerCase()}`} /> {p}
              </button>
            ))}
          </>}

          {tab === 'manage' && <>
            <h4 className="side-heading">Folders <button className="add-btn" onClick={() => setFolderModal({ open: true, initial: null })}>+ Add</button></h4>
            {folders.length === 0 && <p className="muted" style={{ fontSize: 13, padding: '8px 0' }}>No folders yet — add one to start sorting emails.</p>}
            {folders.map(f => (
              <div key={f.id}>
                <div className="manage-row">
                  <span className="color-dot" style={{ background: colorHex(f.color) }} />
                  <span className="manage-name">{f.name}</span>
                  <button className="link-btn tiny" onClick={() => setFolderModal({ open: true, initial: f })}>Edit</button>
                  <button className="link-btn tiny danger" onClick={() => deleteFolder(f.id)}>✕</button>
                </div>
                {f.keywords && <p className="muted" style={{ fontSize: 11, margin: '0 0 4px 20px' }}>{f.keywords}</p>}
              </div>
            ))}
          </>}
        </aside>

        {/* MAIN: email list */}
        <section className="demo-main">
          <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px', padding: '0 2px' }}>
            Use folders and priority filters to organize your inbox.
          </p>
          <div className="inbox-toolbar">
            <input className="search-input" placeholder="Search subject, sender, snippet…" value={q} onChange={e => setQ(e.target.value)} />
            <span className="muted">{visible.length} message{visible.length === 1 ? '' : 's'}</span>
          </div>

          {activeLabel && (
            <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, padding: '4px 2px 8px' }}>
              Filtering: {activeLabel}
            </div>
          )}

          {visible.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h4>No emails match</h4>
              <p>Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="email-list">
              {visible.map(e => (
                <div key={e.id} className={`email-card ${selected?.id === e.id ? 'sel' : ''}`} onClick={() => setSelected(e)}>
                  <div className="email-row1">
                    <div className="from">{e.fromName}</div>
                    <div className="when">{fmtDate(e.receivedAt)}</div>
                  </div>
                  <div className="subj">{e.subject}</div>
                  <div className="snip">{e.snippet}</div>
                  <div className="email-row3">
                    {e.folderName
                      ? <span className="folder-pill" style={{ background: colorHex(e.folderColor) + '22', color: colorHex(e.folderColor) }}>{e.folderName}</span>
                      : <span className="folder-pill empty">Uncategorized</span>
                    }
                    {e.priority && <span className={`pri-pill pri-${e.priority.toLowerCase()}`}>{e.priority}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="detail-panel" onClick={ex => ex.stopPropagation()}>
            <div className="modal-head">
              <button className="link-back" onClick={() => setSelected(null)}>← Back</button>
              <h3>Message</h3>
              <button className="icon-btn" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row"><span className="label">From</span> {selected.fromName} &lt;{selected.fromAddr}&gt;</div>
              <div className="detail-row"><span className="label">Date</span> {new Date(selected.receivedAt).toLocaleString()}</div>
              <div className="detail-row"><span className="label">Folder</span> {selected.folderName || 'Uncategorized'}</div>
              {selected.priority && <div className="detail-row"><span className="label">Priority</span> <span className={`pri-pill pri-${selected.priority.toLowerCase()}`}>{selected.priority}</span></div>}
              <h4 className="detail-subj">{selected.subject}</h4>
              <p className="detail-snip">{selected.snippet}</p>
              <div className="detail-actions">
                <Link to="/login" className="btn btn-primary btn-sm">Connect Gmail to see real emails →</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <FolderModal open={folderModal.open} initial={folderModal.initial}
        onClose={() => setFolderModal({ open: false, initial: null })} onSave={saveFolder} />
      <Toast message={toast} onDone={() => setToast('')} />
    </main>
  )
}
