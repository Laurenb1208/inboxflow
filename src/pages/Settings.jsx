import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../context/Auth.jsx'
import { COLORS } from '../data/defaults.js'
import FolderModal from '../components/FolderModal.jsx'
import FilterModal from '../components/FilterModal.jsx'
import Toast from '../components/Toast.jsx'

export default function Settings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [folders, setFolders] = useState([])
  const [filters, setFilters] = useState([])
  const [autoSort, setAutoSort] = useState(true)
  const [autoSortDraft, setAutoSortDraft] = useState(true)
  const [folderModal, setFolderModal] = useState({ open: false, initial: null })
  const [filterModal, setFilterModal] = useState({ open: false, initial: null })
  const [toast, setToast] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [analytics, setAnalytics] = useState(null)

  const colorHex = name => COLORS.find(c => c.name === name)?.hex || '#9ca3af'
  const folderName = id => folders.find(f => f.id === id)?.name || '—'

  const refresh = async () => {
    const [f, r, s, a] = await Promise.all([
      api.get('/api/folders'),
      api.get('/api/filters'),
      api.get('/api/settings'),
      api.get('/api/analytics'),
    ])
    setFolders(f); setFilters(r); setAutoSort(s.autoSort); setAutoSortDraft(s.autoSort); setAnalytics(a)
  }
  useEffect(() => { refresh() }, [])

  const saveFolder = async (data) => {
    try {
      if (data.id) {
        await api.patch(`/api/folders/${data.id}`, { name: data.name, color: data.color, priority: data.priority })
      } else {
        await api.post('/api/folders', { name: data.name, color: data.color, priority: data.priority })
      }
      await refresh(); setToast('Folder saved')
    } catch (e) { setToast(e.message) }
  }
  const deleteFolder = async (id) => {
    if (!confirm('Delete this folder? Filters using it will be removed too.')) return
    try {
      await api.del(`/api/folders/${id}`); await refresh(); setToast('Folder deleted')
    } catch (e) { setToast(e.message) }
  }
  const saveFilter = async (data) => {
    const folder = folders.find(f => f.name === data.folder)
    if (!folder) return setToast('Pick a valid folder')
    const payload = { name: data.name, keywords: data.keywords, folderId: folder.id, priority: data.priority }
    try {
      if (data.id) await api.patch(`/api/filters/${data.id}`, payload)
      else await api.post('/api/filters', payload)
      await refresh(); setToast('Filter saved')
    } catch (e) { setToast(e.message) }
  }
  const deleteFilter = async (id) => {
    try {
      await api.del(`/api/filters/${id}`); await refresh(); setToast('Filter deleted')
    } catch (e) { setToast(e.message) }
  }

  const saveAll = async () => {
    if (autoSort !== autoSortDraft) {
      await api.put('/api/settings', { autoSort: autoSortDraft })
      setAutoSort(autoSortDraft); setToast('Changes saved')
      await refresh()
    } else {
      setToast('Nothing to save')
    }
  }
  const resetDraft = () => setAutoSortDraft(autoSort)

  const sync = async () => {
    setSyncing(true)
    try {
      const r = await api.post('/api/sync')
      setToast(`Synced ${r.fetched} emails (${r.classified} categorized)`)
      await refresh()
    } catch (e) {
      if (e.body?.error === 'gmail_scope_missing') {
        setToast(e.body.message + ' Sign out and sign back in to fix this.')
      } else {
        setToast('Sync failed: ' + e.message)
      }
    } finally {
      setSyncing(false)
    }
  }

  const filterFolderInitial = (f) => f ? {
    ...f, folder: folderName(f.folderId),
  } : null

  // Convert filters to display format with folder name from id
  const filtersForModal = folders.map(f => ({ id: f.id, name: f.name }))

  return (
    <main className="settings-page">
      <div className="container">
        <div className="settings-bar">
          <div className="bar-left">
            <button className="btn btn-primary btn-sm" onClick={sync} disabled={syncing}>
              {syncing ? 'Syncing…' : 'Sync Now'}
            </button>
            <a className="btn btn-ghost btn-sm" href="https://mail.google.com" target="_blank" rel="noreferrer">
              Return to Email
            </a>
          </div>
          <div className="bar-center">
            <h1>InboxFlow Settings <span className="check">✓</span></h1>
            <div className="connected">— Connected to Gmail{user?.email ? ` (${user.email})` : ''}</div>
          </div>
          <div className="bar-right">
            <button className="link-btn" onClick={() => navigate('/inbox')}>View inbox →</button>
          </div>
        </div>

        <div className="permission-note">
          🔒 You're granting permission for email organization only. InboxFlow never sends replies or replaces your email provider.
        </div>

        {analytics && (
          <div className="analytics-row">
            <AnalyticsCard label="Synced emails" value={analytics.total} />
            <AnalyticsCard label="Categorized" value={`${analytics.percentCategorized}%`} sub={`${analytics.categorized} of ${analytics.total}`} />
            <AnalyticsCard label="High priority" value={analytics.highPriority} sub="needs attention" />
            <AnalyticsCard label="Last sync" value={analytics.lastSyncAt ? formatRel(analytics.lastSyncAt) : '—'} sub={analytics.lastSyncStatus || ''} />
          </div>
        )}

        {/* Folders */}
        <section className="card section-card">
          <div className="card-head">
            <h2>Folders</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setFolderModal({ open: true, initial: null })}>
              + Create or Edit
            </button>
          </div>
          {folders.length === 0 ? (
            <EmptyState icon="📂" title="No folders yet" hint="Create your first folder to start organizing emails." cta="Add folder" onClick={() => setFolderModal({ open: true, initial: null })} />
          ) : (
            <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Folder Name</th><th>Color</th><th>Priority</th><th className="right">Actions</th></tr></thead>
              <tbody>
                {folders.map(f => (
                  <tr key={f.id}>
                    <td>{f.name}</td>
                    <td><span className="color-cell"><span className="color-dot" style={{ background: colorHex(f.color) }} />{f.color}</span></td>
                    <td><span className={`pri-pill pri-${f.priority.toLowerCase()}`}>{f.priority}</span></td>
                    <td className="right">
                      <button className="link-btn" onClick={() => setFolderModal({ open: true, initial: f })}>Edit</button>
                      <button className="link-btn danger" onClick={() => deleteFolder(f.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </section>

        {/* Filters */}
        <section className="card section-card">
          <div className="card-head">
            <h2>Filters &amp; Rules</h2>
            <button className="btn btn-primary btn-sm" disabled={folders.length === 0}
              title={folders.length === 0 ? 'Create a folder first' : ''}
              onClick={() => setFilterModal({ open: true, initial: null })}>
              + Create or Edit
            </button>
          </div>
          {filters.length === 0 ? (
            <EmptyState icon="🎯" title="No filters yet" hint="Add a filter to route incoming emails into the right folder." cta="Add filter" onClick={() => setFilterModal({ open: true, initial: null })} />
          ) : (
            <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>Filter Name</th><th>Keywords</th><th>Folder Name</th><th className="right">Actions</th></tr></thead>
              <tbody>
                {filters.map(f => (
                  <tr key={f.id}>
                    <td>{f.name}</td>
                    <td className="kw">{f.keywords}</td>
                    <td>{folderName(f.folderId)}</td>
                    <td className="right">
                      <button className="link-btn" onClick={() => setFilterModal({ open: true, initial: filterFolderInitial(f) })}>Edit</button>
                      <button className="link-btn danger" onClick={() => deleteFilter(f.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </section>

        {/* Priority Tags */}
        <section className="card section-card">
          <div className="card-head"><h2>Priority Tags</h2></div>
          <div className="priority-row">
            <div className="priority-legend">
              <span className="legend"><span className="r-dot pri-high" /> High</span>
              <span className="legend"><span className="r-dot pri-medium" /> Medium</span>
              <span className="legend"><span className="r-dot pri-low" /> Low</span>
            </div>
            <div className="auto-sort">
              <span className="auto-sort-label">
                Automatically sort emails into <strong>high, medium, and low</strong> priority levels
              </span>
              <label className="switch">
                <input type="checkbox" checked={autoSortDraft} onChange={e => setAutoSortDraft(e.target.checked)} />
                <span className="slider" />
                <span className="switch-text">{autoSortDraft ? 'ON' : 'OFF'}</span>
              </label>
            </div>
          </div>
        </section>

        <div className="action-row">
          <button className="btn btn-primary btn-lg" onClick={saveAll} disabled={autoSort === autoSortDraft}>Save Changes</button>
          <button className="btn btn-ghost btn-lg" onClick={resetDraft}>Reset</button>
        </div>
      </div>

      <FolderModal
        open={folderModal.open}
        initial={folderModal.initial}
        onClose={() => setFolderModal({ open: false, initial: null })}
        onSave={saveFolder}
      />
      <FilterModal
        open={filterModal.open}
        initial={filterModal.initial}
        folders={filtersForModal}
        onClose={() => setFilterModal({ open: false, initial: null })}
        onSave={saveFilter}
      />
      <Toast message={toast} onDone={() => setToast('')} />
    </main>
  )
}

function AnalyticsCard({ label, value, sub }) {
  return (
    <div className="card analytics-card">
      <div className="ac-label">{label}</div>
      <div className="ac-value">{value}</div>
      {sub && <div className="ac-sub">{sub}</div>}
    </div>
  )
}

function EmptyState({ icon, title, hint, cta, onClick }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{hint}</p>
      <button className="btn btn-primary btn-sm" onClick={onClick}>{cta}</button>
    </div>
  )
}

function formatRel(iso) {
  const d = new Date(iso)
  const s = Math.round((Date.now() - d.getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return Math.floor(s / 86400) + 'd ago'
}
