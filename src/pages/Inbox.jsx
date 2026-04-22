import { useEffect, useMemo, useState } from 'react'
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
    } catch (e) { setError('Sync failed: ' + e.message) } finally { setSyncing(false) }
  }

  const toggleImportant = async (e) => {
    const updated = await api.patch(`/api/emails/${e.id}/important`, { important: !e.manuallyImportant })
    setEmails(arr => arr.map(x => x.id === updated.id ? { ...x, manuallyImportant: updated.manuallyImportant } : x))
    if (selected?.id === updated.id) setSelected({ ...selected, manuallyImportant: updated.manuallyImportant })
  }

  return (
    <main className="inbox-page">
      <div className="container inbox-grid">
        <aside className="inbox-side card">
          <button className="btn btn-primary btn-block" onClick={sync} disabled={syncing}>
            {syncing ? 'Syncing…' : 'Sync Now'}
          </button>
          <h4>Folders</h4>
          <button className={`side-item ${folderId === '' ? 'on' : ''}`} onClick={() => setFolderId('')}>All emails</button>
          {folders.map(f => (
            <button key={f.id} className={`side-item ${folderId === f.id ? 'on' : ''}`} onClick={() => setFolderId(f.id)}>
              <span className="color-dot" /> {f.name}
            </button>
          ))}
          <button className={`side-item ${folderId === 'uncategorized' ? 'on' : ''}`} onClick={() => setFolderId('uncategorized')}>Uncategorized</button>

          <h4>Priority</h4>
          {['', 'High', 'Medium', 'Low'].map(p => (
            <button key={p || 'all'} className={`side-item ${priority === p ? 'on' : ''}`} onClick={() => setPriority(p)}>
              {p === '' ? 'All priorities' : (
                <><span className={`r-dot pri-${p.toLowerCase()}`} /> {p}</>
              )}
            </button>
          ))}
        </aside>

        <section className="inbox-main">
          <div className="inbox-toolbar">
            <input className="search-input" placeholder="Search subject, sender, snippet…" value={q} onChange={e => setQ(e.target.value)} />
            <span className="muted">{emails.length} message{emails.length === 1 ? '' : 's'}</span>
          </div>
          {error && <div className="error">{error}</div>}
          {loading ? (
            <div className="empty-state"><p>Loading…</p></div>
          ) : emails.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h4>No emails yet</h4>
              <p>Click <strong>Sync Now</strong> to pull your most recent emails from Gmail.</p>
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
