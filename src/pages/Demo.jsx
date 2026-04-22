import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import FolderModal from '../components/FolderModal.jsx'
import FilterModal from '../components/FilterModal.jsx'
import Toast from '../components/Toast.jsx'
import { COLORS } from '../data/defaults.js'

const SAMPLE_EMAILS = [
  { id: 'e1',  fromName: 'Sara Johnson',    fromAddr: 'sara@company.com',   subject: 'Zoom link — Q2 sync',            snippet: 'Hey team, here is the Zoom link for our Q2 planning call tomorrow at 2 PM.',  receivedAt: '2026-04-22T14:00:00Z' },
  { id: 'e2',  fromName: 'Legal @ Acme',    fromAddr: 'legal@acme.co',      subject: 'Updated contract draft',         snippet: 'Please review the attached contract proposal and let us know your thoughts.',   receivedAt: '2026-04-22T13:30:00Z' },
  { id: 'e3',  fromName: 'HR Team',         fromAddr: 'hr@company.com',     subject: 'FYI: office closure Friday',     snippet: 'Just an update — the office will be closed this Friday for maintenance.',      receivedAt: '2026-04-22T12:00:00Z' },
  { id: 'e4',  fromName: 'Marcus Lee',      fromAddr: 'lead@partner.io',    subject: 'Calendar invite — kickoff',     snippet: 'Sending over a calendar invite for the project kickoff meeting next Monday.',   receivedAt: '2026-04-22T11:00:00Z' },
  { id: 'e5',  fromName: 'Priya Nair',      fromAddr: 'priya@company.com',  subject: 'Quick update on Q3 goals',      snippet: 'Team update: we have finalized the Q3 roadmap. See attached for details.',      receivedAt: '2026-04-22T10:30:00Z' },
  { id: 'e6',  fromName: 'TechCorp Sales',  fromAddr: 'sales@techcorp.com', subject: 'New proposal for your review',  snippet: 'We would love to discuss this proposal with you — let us know your availability.', receivedAt: '2026-04-22T09:00:00Z' },
  { id: 'e7',  fromName: 'Alex Kim',        fromAddr: 'alex@company.com',   subject: 'FYI — policy change',            snippet: 'A quick FYI: the expense reimbursement policy has been updated effective May 1.',  receivedAt: '2026-04-21T17:00:00Z' },
  { id: 'e8',  fromName: 'Client Success',  fromAddr: 'cs@bigclient.com',   subject: 'Contract renewal discussion',   snippet: 'Our contract is up for renewal next month. Can we schedule a call this week?',  receivedAt: '2026-04-21T15:00:00Z' },
  { id: 'e9',  fromName: 'Jamie Torres',    fromAddr: 'jamie@company.com',  subject: 'Zoom standup notes',             snippet: 'Notes from today\'s standup are attached. Action items highlighted in yellow.',   receivedAt: '2026-04-21T14:00:00Z' },
  { id: 'e10', fromName: 'Newsletter',      fromAddr: 'news@digest.com',    subject: 'Your weekly industry digest',   snippet: 'This week in tech: AI tools, remote work trends, and SaaS funding news.',        receivedAt: '2026-04-21T08:00:00Z' },
]

const INIT_FOLDERS = [
  { id: 'f1', name: 'Meetings', color: 'Blue',   priority: 'High'   },
  { id: 'f2', name: 'Clients',  color: 'Green',  priority: 'Medium' },
  { id: 'f3', name: 'Internal', color: 'Purple', priority: 'Low'    },
]

const INIT_FILTERS = [
  { id: 'r1', name: 'Meetings', keywords: 'zoom, calendar', folder: 'Meetings', priority: 'High'   },
  { id: 'r2', name: 'Clients',  keywords: 'contract, proposal', folder: 'Clients', priority: 'Medium' },
  { id: 'r3', name: 'Internal', keywords: 'update, FYI', folder: 'Internal', priority: 'Low'    },
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
