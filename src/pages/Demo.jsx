import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import FolderModal from '../components/FolderModal.jsx'
import FilterModal from '../components/FilterModal.jsx'
import Toast from '../components/Toast.jsx'
import { COLORS } from '../data/defaults.js'

const SAMPLE_EMAILS = [
  // ── MEETINGS (match: zoom, calendar, invite, meeting, reschedule) ── High priority
  { id: 'e1',  fromName: 'Sara Johnson',       fromAddr: 'sara@company.com',        subject: 'Zoom link — Q2 planning sync',           snippet: 'Here is the Zoom link for our Q2 planning call tomorrow at 2 PM. Please join 5 min early.',              receivedAt: '2026-04-22T14:00:00Z' },
  { id: 'e2',  fromName: 'Marcus Lee',         fromAddr: 'lead@partner.io',         subject: 'Calendar invite: project kickoff',         snippet: 'Sending over a calendar invite for the project kickoff meeting next Monday at 10 AM.',                   receivedAt: '2026-04-22T11:00:00Z' },
  { id: 'e3',  fromName: 'Jamie Torres',       fromAddr: 'jamie@company.com',       subject: 'Zoom standup notes — Apr 22',              snippet: 'Notes from today\'s standup are attached. Action items highlighted. Next meeting is Thursday.',             receivedAt: '2026-04-22T09:30:00Z' },
  { id: 'e4',  fromName: 'Amanda Chen',        fromAddr: 'amanda@company.com',      subject: 'Meeting invite: product roadmap review',   snippet: 'Please accept this meeting invite for the product roadmap review on Friday at 1 PM.',                    receivedAt: '2026-04-21T16:00:00Z' },
  { id: 'e5',  fromName: 'David Park',         fromAddr: 'dpark@company.com',       subject: 'Rescheduled: leadership sync → Thursday',  snippet: 'Our leadership sync has been rescheduled from Wednesday to Thursday at 3 PM. Calendar updated.',           receivedAt: '2026-04-21T14:30:00Z' },
  { id: 'e6',  fromName: 'Operations Team',    fromAddr: 'ops@company.com',         subject: 'All-hands meeting tomorrow at 3 PM',       snippet: 'Reminder: all-hands meeting is tomorrow at 3 PM in the main conference room. Zoom link in calendar.',     receivedAt: '2026-04-21T10:00:00Z' },
  { id: 'e7',  fromName: 'Raj Patel',          fromAddr: 'raj@company.com',         subject: 'Invite: sprint planning — please confirm', snippet: 'Please accept this invite for our sprint planning session on Monday at 9 AM. Zoom link attached.',          receivedAt: '2026-04-20T15:00:00Z' },
  { id: 'e8',  fromName: 'Lisa Wong',          fromAddr: 'lisa@company.com',        subject: 'Weekly team meeting notes — Apr 21',       snippet: 'Here are the notes from yesterday\'s weekly team meeting. Decisions and follow-up actions listed inside.',  receivedAt: '2026-04-20T09:00:00Z' },
  { id: 'e9',  fromName: 'Ben Walker',         fromAddr: 'ben@agency.com',          subject: 'Zoom link for design review this Friday',  snippet: 'I\'ll send the Zoom link for the design review call. Can you confirm Friday at 11 AM still works?',         receivedAt: '2026-04-18T13:00:00Z' },
  { id: 'e10', fromName: 'Caroline Nash',      fromAddr: 'caroline@company.com',    subject: 'Reschedule request: Monday standup',       snippet: 'Hey, would it be possible to reschedule Monday\'s standup to 9 AM instead of 10? Calendar invite updated.', receivedAt: '2026-04-17T17:30:00Z' },

  // ── CLIENTS (match: contract, proposal, invoice, deliverable, follow-up) ── Medium priority
  { id: 'e11', fromName: 'Legal @ Acme',       fromAddr: 'legal@acme.co',           subject: 'Updated contract draft for review',        snippet: 'Please review the attached contract draft and let us know if you have any revisions before signing.',      receivedAt: '2026-04-22T13:30:00Z' },
  { id: 'e12', fromName: 'TechCorp Sales',     fromAddr: 'sales@techcorp.com',      subject: 'New proposal for your review',             snippet: 'Attached is the revised proposal with updated pricing. Let us know your availability to discuss.',          receivedAt: '2026-04-22T09:00:00Z' },
  { id: 'e13', fromName: 'Client Success',     fromAddr: 'cs@bigclient.com',        subject: 'Contract renewal — can we schedule a call?', snippet: 'Our contract is up for renewal next month. I\'d love to schedule a call to discuss terms this week.',      receivedAt: '2026-04-21T15:00:00Z' },
  { id: 'e14', fromName: 'GlobalVentures',     fromAddr: 'billing@globalv.com',     subject: 'Invoice #4421 attached for approval',      snippet: 'Please find Invoice #4421 for Q1 services attached. Kindly approve for payment within 14 days.',           receivedAt: '2026-04-21T11:00:00Z' },
  { id: 'e15', fromName: 'Kate Reynolds',      fromAddr: 'kreynolds@mediaco.com',   subject: 'Deliverable checklist — Q2 campaign',      snippet: 'Sharing the final deliverable checklist for the Q2 campaign. Please confirm which items are in scope.',      receivedAt: '2026-04-20T14:00:00Z' },
  { id: 'e16', fromName: 'Zoe Hammond',        fromAddr: 'zoe@partnerco.com',       subject: 'Follow-up: expansion discussion',          snippet: 'Following up on our call last week regarding the potential expansion into the EU market. Let me know.',      receivedAt: '2026-04-20T11:30:00Z' },
  { id: 'e17', fromName: 'Meridian Partners',  fromAddr: 'hello@meridian.io',       subject: 'Proposal feedback — we\'re ready to move forward', snippet: 'We\'ve reviewed your proposal and are ready to move forward. Can we get a revised contract by Friday?',  receivedAt: '2026-04-19T16:00:00Z' },
  { id: 'e18', fromName: 'Enterprise Solutions', fromAddr: 'accounts@entsol.com',   subject: 'Revised proposal — new pricing model',    snippet: 'Please find the revised proposal with our new pricing model attached. Open to a call to walk you through it.', receivedAt: '2026-04-18T10:00:00Z' },
  { id: 'e19', fromName: 'Horizon Group',      fromAddr: 'contracts@horizon.biz',   subject: 'Contract terms — final round of edits',   snippet: 'We are on the last round of contract edits. Attached is the redlined version with our legal team\'s notes.',  receivedAt: '2026-04-17T14:00:00Z' },
  { id: 'e20', fromName: 'ClientCo Billing',   fromAddr: 'billing@clientco.com',    subject: 'Invoice #887 — please review',             snippet: 'Your invoice #887 is ready. Total due: $4,200. Please review and let us know if you have any questions.',    receivedAt: '2026-04-16T09:00:00Z' },

  // ── INTERNAL (match: update, FYI, internal, team, reminder) ── Low priority
  { id: 'e21', fromName: 'HR Team',            fromAddr: 'hr@company.com',          subject: 'FYI: office closed Friday',                snippet: 'Just an update — the office will be closed this Friday for scheduled maintenance. Work from home.',          receivedAt: '2026-04-22T12:00:00Z' },
  { id: 'e22', fromName: 'Priya Nair',         fromAddr: 'priya@company.com',       subject: 'Update: Q3 goals finalized',               snippet: 'Team update: the Q3 roadmap has been finalized. Please review the shared doc and add your OKRs by EOD.',     receivedAt: '2026-04-22T10:30:00Z' },
  { id: 'e23', fromName: 'Alex Kim',           fromAddr: 'alex@company.com',        subject: 'FYI — expense policy change May 1',        snippet: 'A quick FYI: the expense reimbursement policy has been updated effective May 1. See attached PDF.',             receivedAt: '2026-04-21T17:00:00Z' },
  { id: 'e24', fromName: 'Engineering Team',   fromAddr: 'eng@company.com',         subject: 'Internal: deployment Saturday night',      snippet: 'Internal notice: we are deploying v2.4 Saturday at 11 PM. Expect up to 30 min of downtime for the API.',    receivedAt: '2026-04-21T13:00:00Z' },
  { id: 'e25', fromName: 'All-Hands',          fromAddr: 'allhands@company.com',    subject: 'Reminder: submit Q2 OKR updates by EOD',  snippet: 'Team reminder — please submit your quarterly OKR updates in the shared tracker by 5 PM today. Thank you!',   receivedAt: '2026-04-20T08:00:00Z' },
  { id: 'e26', fromName: 'IT Support',         fromAddr: 'it@company.com',          subject: 'Team reminder: 2FA required from Monday',  snippet: 'Friendly reminder: two-factor authentication becomes mandatory for all team members starting this Monday.',    receivedAt: '2026-04-19T11:00:00Z' },
  { id: 'e27', fromName: 'Finance',            fromAddr: 'finance@company.com',     subject: 'FYI: expense window closes Friday',        snippet: 'Internal FYI — the Q1 expense reimbursement submission window closes this Friday at 5 PM. Submit now.',       receivedAt: '2026-04-18T09:30:00Z' },
  { id: 'e28', fromName: 'Marketing Team',     fromAddr: 'marketing@company.com',   subject: 'Internal update: new brand guidelines',   snippet: 'Team update: the new brand guidelines are published on Notion. Please review before creating new materials.',   receivedAt: '2026-04-17T10:00:00Z' },

  // ── UNCATEGORIZED (no keyword match) ──
  { id: 'e29', fromName: 'Amazon',             fromAddr: 'ship-confirm@amazon.com', subject: 'Your order has shipped — arrives tomorrow', snippet: 'Good news! Your order of "Mechanical Keyboard Pro" has shipped and arrives tomorrow by 8 PM.',               receivedAt: '2026-04-22T08:00:00Z' },
  { id: 'e30', fromName: 'GitHub',             fromAddr: 'noreply@github.com',      subject: 'Security alert on your repository',        snippet: 'A dependency in your repository has a known vulnerability. Review the Dependabot alert and apply the fix.',   receivedAt: '2026-04-22T07:30:00Z' },
  { id: 'e31', fromName: 'Weekly Digest',      fromAddr: 'news@techdigest.com',     subject: 'Your weekly industry digest',              snippet: 'This week in tech: AI tools, remote work trends, SaaS funding rounds, and the top reads from the community.',  receivedAt: '2026-04-21T08:00:00Z' },
  { id: 'e32', fromName: 'LinkedIn',           fromAddr: 'messaging@linkedin.com',  subject: '3 new connections are looking at you',    snippet: 'You have 3 new profile views and 2 pending connection requests. Log in to see who wants to connect.',          receivedAt: '2026-04-20T16:00:00Z' },
  { id: 'e33', fromName: 'Stripe',             fromAddr: 'reports@stripe.com',      subject: 'Weekly payout summary — Apr 14–21',       snippet: 'Your weekly payout of $1,240.00 has been sent to your bank account. View the full breakdown in your dashboard.',  receivedAt: '2026-04-20T07:00:00Z' },
  { id: 'e34', fromName: 'DocuSign',           fromAddr: 'dse@docusign.net',        subject: 'Please sign: NDA for vendor onboarding',  snippet: 'You have been sent a document to sign: "Mutual NDA — Vendor Onboarding". Click to review and sign securely.',   receivedAt: '2026-04-19T14:00:00Z' },
  { id: 'e35', fromName: 'no-reply@flights',   fromAddr: 'confirm@flightapp.com',   subject: 'Flight confirmation: ORD → JFK Apr 28',   snippet: 'Your flight UA2284 from Chicago O\'Hare to New York JFK on April 28 at 7:15 AM is confirmed. Check in opens 24h before.',  receivedAt: '2026-04-18T15:00:00Z' },
  { id: 'e36', fromName: 'Webinar Host',       fromAddr: 'events@saasconf.com',     subject: 'You\'re registered: Growth Hacking 2026', snippet: 'You\'re confirmed for "Growth Hacking in 2026" on May 3 at 11 AM ET. A recording will be sent automatically.',        receivedAt: '2026-04-17T12:00:00Z' },
]

const INIT_FOLDERS = [
  { id: 'f1', name: 'Meetings', color: 'Blue',   priority: 'High'   },
  { id: 'f2', name: 'Clients',  color: 'Green',  priority: 'Medium' },
  { id: 'f3', name: 'Internal', color: 'Purple', priority: 'Low'    },
]

const INIT_FILTERS = [
  { id: 'r1', name: 'Meetings', keywords: 'zoom, calendar, invite, meeting, reschedule', folder: 'Meetings', priority: 'High'   },
  { id: 'r2', name: 'Clients',  keywords: 'contract, proposal, invoice, deliverable, follow-up', folder: 'Clients', priority: 'Medium' },
  { id: 'r3', name: 'Internal', keywords: 'update, FYI, internal, team, reminder', folder: 'Internal', priority: 'Low'    },
]

function classify(email, filters, folders) {
  const hay = [email.subject, email.snippet, email.fromAddr, email.fromName].join(' ').toLowerCase()
  for (const f of filters) {
    const hit = f.keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean).some(k => hay.includes(k))
    if (hit) {
      const folder = folders.find(x => x.name === f.folder)
      if (folder) return { folderId: folder.id, folderName: folder.name, folderColor: folder.color, priority: f.priority }
    }
  }
  return { folderId: null, folderName: null, folderColor: null, priority: null }
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
  const [filters, setFilters] = useState(INIT_FILTERS)
  const [folderModal, setFolderModal] = useState({ open: false, initial: null })
  const [filterModal, setFilterModal] = useState({ open: false, initial: null })
  const [toast, setToast] = useState('')
  const [activeFolderId, setActiveFolderId] = useState('')
  const [activePriority, setActivePriority] = useState('')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('inbox')

  const emails = useMemo(() => SAMPLE_EMAILS.map(e => ({ ...e, ...classify(e, filters, folders) })), [filters, folders])

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

  // --- Folder CRUD ---
  const saveFolder = (data) => {
    if (data.id) {
      setFolders(fs => fs.map(f => f.id === data.id ? { ...f, ...data } : f))
      setFilters(rs => rs.map(r => r.folder === folders.find(f => f.id === data.id)?.name ? { ...r, folder: data.name } : r))
      setToast('Folder updated')
    } else {
      const exists = folders.some(f => f.name.toLowerCase() === data.name.toLowerCase())
      if (exists) { setToast('A folder with that name already exists'); return }
      setFolders(fs => [...fs, { ...data, id: uid() }])
      setToast('Folder created')
    }
  }
  const deleteFolder = (id) => {
    const folder = folders.find(f => f.id === id)
    setFolders(fs => fs.filter(f => f.id !== id))
    setFilters(rs => rs.filter(r => r.folder !== folder?.name))
    if (activeFolderId === id) setActiveFolderId('')
    setToast('Folder deleted')
  }

  // --- Filter CRUD ---
  const saveFilter = (data) => {
    const folder = folders.find(f => f.name === data.folder)
    if (!folder) { setToast('Pick a valid folder'); return }
    if (data.id) {
      setFilters(rs => rs.map(r => r.id === data.id ? { ...r, ...data } : r))
      setToast('Filter updated')
    } else {
      setFilters(rs => [...rs, { ...data, id: uid() }])
      setToast('Filter created')
    }
  }
  const deleteFilter = (id) => { setFilters(rs => rs.filter(r => r.id !== id)); setToast('Filter deleted') }

  const categorized = emails.filter(e => e.folderId).length
  const highPri = emails.filter(e => e.priority === 'High').length

  return (
    <main className="demo-page">
      <div className="demo-banner">
        <span>🎮 <strong>Interactive Demo</strong> — sample data only. No real emails.</span>
        <Link to="/login" className="btn btn-primary btn-sm">Connect your Gmail →</Link>
      </div>

      <div className="container demo-layout">
        {/* LEFT: inbox sidebar */}
        <aside className="demo-side card">
          <div className="demo-stats">
            <div className="ds"><span className="ds-val">{emails.length}</span><span className="ds-lbl">Emails</span></div>
            <div className="ds"><span className="ds-val">{categorized}</span><span className="ds-lbl">Sorted</span></div>
            <div className="ds"><span className="ds-val">{highPri}</span><span className="ds-lbl">High</span></div>
          </div>

          <div className="demo-tabs">
            <button className={`dtab ${tab === 'inbox' ? 'on' : ''}`} onClick={() => setTab('inbox')}>📥 Inbox</button>
            <button className={`dtab ${tab === 'manage' ? 'on' : ''}`} onClick={() => setTab('manage')}>⚙️ Rules</button>
          </div>

          {tab === 'inbox' && <>
            <h4 className="side-heading">Folders</h4>
            <button className={`side-item ${activeFolderId === '' ? 'on' : ''}`} onClick={() => setActiveFolderId('')}>All emails</button>
            {folders.map(f => (
              <button key={f.id} className={`side-item ${activeFolderId === f.id ? 'on' : ''}`} onClick={() => setActiveFolderId(f.id)}>
                <span className="color-dot" style={{ background: colorHex(f.color) }} /> {f.name}
              </button>
            ))}
            <button className={`side-item ${activeFolderId === 'uncategorized' ? 'on' : ''}`} onClick={() => setActiveFolderId('uncategorized')}>Uncategorized</button>

            <h4 className="side-heading">Priority</h4>
            {['', 'High', 'Medium', 'Low'].map(p => (
              <button key={p || 'all'} className={`side-item ${activePriority === p ? 'on' : ''}`} onClick={() => setActivePriority(p)}>
                {p === '' ? 'All priorities' : <><span className={`r-dot pri-${p.toLowerCase()}`} /> {p}</>}
              </button>
            ))}
          </>}

          {tab === 'manage' && <>
            <h4 className="side-heading">Folders <button className="add-btn" onClick={() => setFolderModal({ open: true, initial: null })}>+ Add</button></h4>
            {folders.map(f => (
              <div key={f.id} className="manage-row">
                <span className="color-dot" style={{ background: colorHex(f.color) }} />
                <span className="manage-name">{f.name}</span>
                <button className="link-btn tiny" onClick={() => setFolderModal({ open: true, initial: f })}>Edit</button>
                <button className="link-btn tiny danger" onClick={() => deleteFolder(f.id)}>✕</button>
              </div>
            ))}

            <h4 className="side-heading" style={{ marginTop: 20 }}>Filters <button className="add-btn" onClick={() => setFilterModal({ open: true, initial: null })} disabled={folders.length === 0}>+ Add</button></h4>
            {filters.map(r => (
              <div key={r.id} className="manage-row">
                <span className="manage-name" style={{ fontSize: 12 }}>{r.name}: <span className="muted">{r.keywords}</span></span>
                <button className="link-btn tiny" onClick={() => setFilterModal({ open: true, initial: r })}>Edit</button>
                <button className="link-btn tiny danger" onClick={() => deleteFilter(r.id)}>✕</button>
              </div>
            ))}
            {filters.length === 0 && <p className="muted" style={{ fontSize: 13, padding: '8px 0' }}>No filters yet — add one to auto-sort emails.</p>}
          </>}
        </aside>

        {/* MAIN: email list */}
        <section className="demo-main">
          <div className="inbox-toolbar">
            <input className="search-input" placeholder="Search subject, sender, snippet…" value={q} onChange={e => setQ(e.target.value)} />
            <span className="muted">{visible.length} message{visible.length === 1 ? '' : 's'}</span>
          </div>

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
      <FilterModal open={filterModal.open} initial={filterModal.initial} folders={folders}
        onClose={() => setFilterModal({ open: false, initial: null })} onSave={saveFilter} />
      <Toast message={toast} onDone={() => setToast('')} />
    </main>
  )
}
