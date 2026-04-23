import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { COLORS } from '../data/defaults.js'

// ─── Exactly 3 demo folders, 4 keywords each ──────────────────────────────
const INIT_FOLDERS = [
  { id: 'f1', name: 'Meetings', color: 'Blue',   keywords: 'zoom, calendar, invite, meeting' },
  { id: 'f2', name: 'Clients',  color: 'Green',  keywords: 'contract, proposal, invoice, follow-up' },
  { id: 'f3', name: 'Internal', color: 'Purple', keywords: 'update, FYI, internal, team' },
]

// ─── Sample emails: all 3 folders (H/M/L each) + a few Uncategorized ──────
const SAMPLE_EMAILS = [
  // MEETINGS — zoom, calendar, invite, meeting
  { id: 'e1',  priority: 'High',   fromName: 'Sara Johnson',    fromAddr: 'sara@company.com',          subject: 'Zoom link — Q2 planning sync',               snippet: 'Here is the Zoom link for our Q2 planning call tomorrow at 2 PM. Please join 5 min early.',                receivedAt: '2026-04-22T14:00:00Z' },
  { id: 'e2',  priority: 'High',   fromName: 'Marcus Lee',      fromAddr: 'lead@partner.io',           subject: 'Calendar invite: project kickoff',           snippet: 'Sending over a calendar invite for the project kickoff meeting next Monday at 10 AM.',                     receivedAt: '2026-04-22T11:00:00Z' },
  { id: 'e3',  priority: 'Medium', fromName: 'Jamie Torres',    fromAddr: 'jamie@company.com',         subject: 'Zoom standup notes — Apr 22',                snippet: "Notes from today's standup are attached. Action items highlighted. Next meeting is Thursday.",             receivedAt: '2026-04-22T09:30:00Z' },
  { id: 'e5',  priority: 'Medium', fromName: 'David Park',      fromAddr: 'dpark@company.com',         subject: 'Meeting invite: leadership sync Thursday',   snippet: 'Please accept the invite for our leadership sync rescheduled to Thursday at 3 PM. Calendar updated.',      receivedAt: '2026-04-21T14:30:00Z' },
  { id: 'e6',  priority: 'Low',    fromName: 'Operations Team', fromAddr: 'ops@company.com',           subject: 'All-hands meeting tomorrow at 3 PM',         snippet: 'Reminder: all-hands meeting is tomorrow at 3 PM in the main conference room. Zoom link in calendar.',      receivedAt: '2026-04-21T10:00:00Z' },
  { id: 'e8',  priority: 'Low',    fromName: 'Lisa Wong',       fromAddr: 'lisa@company.com',          subject: 'Weekly team meeting notes — Apr 21',         snippet: "Here are the notes from yesterday's weekly team meeting. Decisions and follow-up actions listed inside.",   receivedAt: '2026-04-20T09:00:00Z' },

  // CLIENTS — contract, proposal, invoice, follow-up
  { id: 'e11', priority: 'High',   fromName: 'Legal @ Acme',    fromAddr: 'legal@acme.co',             subject: 'Updated contract draft for review',          snippet: 'Please review the attached contract draft and let us know if you have any revisions before signing.',       receivedAt: '2026-04-22T13:30:00Z' },
  { id: 'e13', priority: 'High',   fromName: 'Client Success',  fromAddr: 'cs@bigclient.com',          subject: 'Contract renewal — can we schedule a call?', snippet: "Our contract is up for renewal next month. I'd love to schedule a call to discuss terms this week.",       receivedAt: '2026-04-21T15:00:00Z' },
  { id: 'e12', priority: 'Medium', fromName: 'TechCorp Sales',  fromAddr: 'sales@techcorp.com',        subject: 'New proposal for your review',               snippet: 'Attached is the revised proposal with updated pricing. Let us know your availability to discuss.',          receivedAt: '2026-04-22T09:00:00Z' },
  { id: 'e16', priority: 'Medium', fromName: 'Zoe Hammond',     fromAddr: 'zoe@partnerco.com',         subject: 'Follow-up: expansion discussion',            snippet: 'Following up on our call last week regarding the potential expansion into the EU market. Let me know.',     receivedAt: '2026-04-20T11:30:00Z' },
  { id: 'e15', priority: 'Low',    fromName: 'GlobalVentures',  fromAddr: 'billing@globalv.com',       subject: 'Invoice #4421 attached for approval',        snippet: 'Please find Invoice #4421 for Q1 services attached. Kindly approve for payment within 14 days.',           receivedAt: '2026-04-20T14:00:00Z' },
  { id: 'e44', priority: 'Low',    fromName: 'Apex Consulting',  fromAddr: 'hello@apexco.com',         subject: 'Follow-up: still waiting on your decision',  snippet: 'Just following up on the proposal I sent last week. Happy to jump on a quick call to answer questions.',    receivedAt: '2026-04-13T11:30:00Z' },

  // INTERNAL — update, FYI, internal, team
  { id: 'e24', priority: 'High',   fromName: 'Engineering Team', fromAddr: 'eng@company.com',          subject: 'Internal: deployment Saturday night',        snippet: 'Internal notice: we are deploying v2.4 Saturday at 11 PM. Expect up to 30 min of downtime for the API.',  receivedAt: '2026-04-21T13:00:00Z' },
  { id: 'e26', priority: 'High',   fromName: 'IT Support',       fromAddr: 'it@company.com',           subject: 'Team reminder: 2FA required from Monday',    snippet: 'Friendly reminder: two-factor authentication becomes mandatory for all team members starting this Monday.',  receivedAt: '2026-04-19T11:00:00Z' },
  { id: 'e22', priority: 'Medium', fromName: 'Priya Nair',       fromAddr: 'priya@company.com',        subject: 'Update: Q3 goals finalized',                 snippet: 'Team update: the Q3 roadmap has been finalized. Please review the shared doc and add your OKRs by EOD.',   receivedAt: '2026-04-22T10:30:00Z' },
  { id: 'e25', priority: 'Medium', fromName: 'All-Hands',        fromAddr: 'allhands@company.com',     subject: 'Reminder: submit Q2 OKR updates by EOD',     snippet: 'Team reminder — please submit your quarterly OKR updates in the shared tracker by 5 PM today. Thank you!',  receivedAt: '2026-04-20T08:00:00Z' },
  { id: 'e21', priority: 'Low',    fromName: 'HR Team',          fromAddr: 'hr@company.com',           subject: 'FYI: office closed Friday',                  snippet: 'Just an update — the office will be closed this Friday for scheduled maintenance. Work from home.',          receivedAt: '2026-04-22T12:00:00Z' },
  { id: 'e23', priority: 'Low',    fromName: 'Alex Kim',         fromAddr: 'alex@company.com',         subject: 'FYI — expense policy change May 1',          snippet: 'A quick FYI: the expense reimbursement policy has been updated effective May 1. See attached PDF.',           receivedAt: '2026-04-21T17:00:00Z' },

  // UNCATEGORIZED — no keyword match
  { id: 'e30', priority: null, fromName: 'GitHub',        fromAddr: 'noreply@github.com',     subject: 'Security alert on your repository',      snippet: 'A dependency in your repository has a known vulnerability. Review the Dependabot alert and apply the fix.',  receivedAt: '2026-04-22T07:30:00Z' },
  { id: 'e31', priority: null, fromName: 'Weekly Digest', fromAddr: 'news@techdigest.com',    subject: 'Your weekly industry digest',            snippet: 'This week in tech: AI tools, remote work trends, SaaS funding rounds, and the top reads from the community.',  receivedAt: '2026-04-21T08:00:00Z' },
  { id: 'e32', priority: null, fromName: 'LinkedIn',      fromAddr: 'messaging@linkedin.com', subject: '3 new connections are looking at you',   snippet: 'You have 3 new profile views and 2 pending connection requests. Log in to see who wants to connect.',           receivedAt: '2026-04-20T16:00:00Z' },
  { id: 'e36', priority: null, fromName: 'Webinar Host',  fromAddr: 'events@saasconf.com',    subject: "You're registered: Growth Hacking 2026", snippet: "You're confirmed for \"Growth Hacking in 2026\" on May 3 at 11 AM ET. A recording will be sent automatically.", receivedAt: '2026-04-17T12:00:00Z' },
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

export default function Demo() {
  const [activeFolderId, setActiveFolderId] = useState('')
  const [activePriority, setActivePriority] = useState('')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(null)

  const emails = useMemo(() => SAMPLE_EMAILS.map(e => ({ ...e, ...classify(e, INIT_FOLDERS) })), [])

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
    else if (activeFolderId) parts.push(INIT_FOLDERS.find(f => f.id === activeFolderId)?.name || '')
    if (activePriority) parts.push(activePriority)
    return parts.join(' + ')
  }, [activeFolderId, activePriority])

  const categorized = emails.filter(e => e.folderId).length

  return (
    <main className="demo-page">
      <div className="demo-banner">
        <span>🎮 <strong>Interactive Demo</strong> — sample data only. No real emails.</span>
        <Link to="/login" className="btn btn-primary btn-sm">Connect your Gmail →</Link>
      </div>

      <div className="container demo-layout">
        {/* LEFT: sidebar — inbox filters only, no folder management */}
        <aside className="demo-side card">
          <div className="demo-stats">
            <div className="ds"><span className="ds-val">{emails.length}</span><span className="ds-lbl">Emails</span></div>
            <div className="ds"><span className="ds-val">{categorized}</span><span className="ds-lbl">Sorted</span></div>
            <div className="ds"><span className="ds-val">{INIT_FOLDERS.length}</span><span className="ds-lbl">Folders</span></div>
          </div>

          <h4 className="side-heading">Folders</h4>
          <button className={`side-item ${activeFolderId === '' ? 'on' : ''}`} onClick={() => setActiveFolderId('')}>All emails</button>
          {INIT_FOLDERS.map(f => (
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
    </main>
  )
}
