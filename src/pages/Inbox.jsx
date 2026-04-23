import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

export default function Inbox() {
  const [folders, setFolders] = useState([])
  const [emails, setEmails] = useState([])
  const [folderId, setFolderId] = useState('')
  const [priority, setPriority] = useState('')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')
  const [sideOpen, setSideOpen] = useState(false)

  const loadFolders = async () => setFolders(await api.get('/api/folders'))
  const loadEmails = async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams()
      if (folderId) params.set('folderId', folderId)
      if (priority) params.set('priority', priority)
      if (q) params.set('q', q)
      setEmails(await api.get('/api/emails?' + params.toString()))
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { loadFolders() }, [])
  useEffect(() => { loadEmails() }, [folderId, priority])
  useEffect(() => { const t = setTimeout(loadEmails, 250); return () => clearTimeout(t) }, [q])

  const sync = async () => {
    setSyncing(true)
    try {
      const r = await api.post('/api/sync')
      await loadEmails()
      alert(`Synced ${r.fetched} emails (${r.classified} categorized)`)
    } catch (e) {
      if (e.body?.error === 'gmail_scope_missing') {
        setError(e.body.message + ' Use the "Sign out" link in the top menu.')
      } else {
        setError('Sync failed: ' + e.message)
      }
    } finally { setSyncing(false) }
  }

  const toggleImportant = async (e) => {
    const updated = await api.patch(`/api/emails/${e.id}/important`, { important: !e.manuallyImportant })
    setEmails(arr => arr.map(x => x.id === updated.id ? { ...x, manuallyImportant: updated.manuallyImportant } : x))
    if (selected?.id === updated.id) setSelected({ ...selected, manuallyImportant: updated.manuallyImportant })
  }

  const activeLabel = (() => {
    const parts = []
    if (folderId === 'uncategorized') parts.push('Uncategorized')
    else if (folderId) parts.push(folders.find(f => f.id === folderId)?.name || '')
    if (priority) parts.push(priority)
    return parts.join(' + ')
  })()

  return (
    <main className="inbox-page">
      <div className="container inbox-grid">

        {sideOpen && <div className="side-overlay" onClick={() => setSideOpen(false)} />}

        <aside className={`inbox-side card ${sideOpen ? 'side-open' : ''}`}>
          <button className="btn btn-primary btn-block" onClick={sync} disabled={syncing}>
            {syncing ? 'Syncing…' : 'Sync Now'}
          </button>

          <h4>Folders</h4>
          <button className={`side-item ${folderId === '' ? 'on' : ''}`} onClick={() => { setFolderId(''); setSideOpen(false) }}>All emails</button>
          {folders.map(f => (
            <button key={f.id} className={`side-item ${folderId === f.id ? 'on' : ''}`} onClick={() => { setFolderId(cur => cur === f.id ? '' : f.id); setSideOpen(false) }}>
              <span className="color-dot" /> {f.name}
            </button>
          ))}
          <button className={`side-item ${folderId === 'uncategorized' ? 'on' : ''}`} onClick={() => { setFolderId(cur => cur === 'uncategorized' ? '' : 'uncategorized'); setSideOpen(false) }}>Uncategorized</button>

          <h4>Priority</h4>
          <button className={`side-item ${priority === '' ? 'on' : ''}`} onClick={() => { setPriority(''); setSideOpen(false) }}>All priorities</button>
          {['High', 'Medium', 'Low'].map(p => (
            <button key={p} className={`side-item ${priority === p ? 'on' : ''}`} onClick={() => { setPriority(cur => cur === p ? '' : p); setSideOpen(false) }}>
              <span className={`r-dot pri-${p.toLowerCase()}`} /> {p}
            </button>
          ))}
        </aside>

        <section className="inbox-main">
          <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px' }}>
            Use folders and priority filters to organize your inbox.
          </p>
          <div className="inbox-toolbar">
            <button className="filter-toggle" onClick={() => setSideOpen(o => !o)} aria-label="Toggle filters">
              ☰ <span className="filter-label">{activeLabel || 'All emails'}</span>
            </button>
            <input className="search-input" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
            <span className="muted count-label">{emails.length} msg{emails.length === 1 ? '' : 's'}</span>
          </div>
          {activeLabel && (
            <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, padding: '4px 0 8px' }}>
              Filtering: {activeLabel}
            </div>
          )}
          {error && <div className="error">{error}</div>}
          {loading ? (
            <div className="empty-state"><p>Loading…</p></div>
          ) : emails.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h4>No emails match</h4>
              <p>Try adjusting your filters, or click <strong>Sync Now</strong> to pull new emails.</p>
            </div>
          ) : (
            <div className="email-list">
              {emails.map(e => (
                <div key={e.id} className={`email-card ${selected?.id === e.id ? 'sel' : ''}`} onClick={() => setSelected(e)}>
                  <div className="email-row1">
                    <div className="from">
                      {e.manuallyImportant && <span title="Marked important">⭐</span>}
                      {e.fromName || e.fromAddr || 'Unknown'}
                    </div>
                    <div className="when">{formatDate(e.receivedAt)}</div>
                  </div>
                  <div className="subj">{e.subject || '(no subject)'}</div>
                  <div className="snip">{e.snippet}</div>
                  <div className="email-row3">
                    {e.folderName ? <span className="folder-pill">{e.folderName}</span> : <span className="folder-pill empty">Uncategorized</span>}
                    {e.priority && <span className={`pri-pill pri-${e.priority.toLowerCase()}`}>{e.priority}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="detail-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <button className="link-back" onClick={() => setSelected(null)}>← Back</button>
              <h3>Message</h3>
              <button className="icon-btn" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row"><span className="label">From</span> {selected.fromName ? `${selected.fromName} <${selected.fromAddr}>` : selected.fromAddr}</div>
              <div className="detail-row"><span className="label">Date</span> {formatDate(selected.receivedAt, true)}</div>
              <div className="detail-row"><span className="label">Folder</span> {selected.folderName || 'Uncategorized'}</div>
              {selected.priority && <div className="detail-row"><span className="label">Priority</span> <span className={`pri-pill pri-${selected.priority.toLowerCase()}`}>{selected.priority}</span></div>}
              <h4 className="detail-subj">{selected.subject || '(no subject)'}</h4>
              <p className="detail-snip">{selected.snippet}</p>
              <div className="detail-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => toggleImportant(selected)}>
                  {selected.manuallyImportant ? '★ Marked important' : '☆ Mark as important'}
                </button>
                <a className="btn btn-primary btn-sm"
                   href={`https://mail.google.com/mail/u/0/#inbox/${selected.gmailMessageId}`}
                   target="_blank" rel="noreferrer">Open in Gmail →</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function formatDate(iso, full) {
  if (!iso) return ''
  const d = new Date(iso)
  if (full) return d.toLocaleString()
  const today = new Date(); today.setHours(0,0,0,0)
  const dDay = new Date(d); dDay.setHours(0,0,0,0)
  if (dDay.getTime() === today.getTime()) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
