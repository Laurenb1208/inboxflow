import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useAuth } from '../context/Auth.jsx'
import FolderModal from '../components/FolderModal.jsx'
import FolderTable from '../components/FolderTable.jsx'
import Toast from '../components/Toast.jsx'

export default function Settings() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [folders, setFolders] = useState([])
  const [filters, setFilters] = useState([])
  const [autoSort, setAutoSort] = useState(true)
  const [autoSortDraft, setAutoSortDraft] = useState(true)
  const [folderModal, setFolderModal] = useState({ open: false, initial: null })
  const [toast, setToast] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [analytics, setAnalytics] = useState(null)

  const linkedFilter = folderId => filters.find(f => f.folderId === folderId)

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
      const pri = data.priority || 'Medium'
      if (data.id) {
        await api.patch(`/api/folders/${data.id}`, { name: data.name, color: data.color, priority: pri })
        const linked = linkedFilter(data.id)
        if (data.keywords) {
          if (linked) {
            await api.patch(`/api/filters/${linked.id}`, {
              name: data.name, keywords: data.keywords, folderId: data.id, priority: pri,
            })
          } else {
            await api.post('/api/filters', { name: data.name, keywords: data.keywords, folderId: data.id, priority: pri })
          }
        }
      } else {
        const folder = await api.post('/api/folders', { name: data.name, color: data.color, priority: pri })
        if (data.keywords) {
          await api.post('/api/filters', { name: folder.name, keywords: data.keywords, folderId: folder.id, priority: pri })
        }
      }
      await refresh(); setToast('Folder saved')
    } catch (e) { setToast(e.message) }
  }

  const deleteFolder = async (id) => {
    if (!confirm('Delete this folder? Its sorting rule will be removed too.')) return
    try {
      await api.del(`/api/folders/${id}`); await refresh(); setToast('Folder deleted')
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

  const openEditFolder = (folder) => {
    const lf = linkedFilter(folder.id)
    setFolderModal({ open: true, initial: { ...folder, keywords: lf?.keywords || '' } })
  }

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
            <h1>InboxFlow Settings</h1>
            <GmailStatus loading={authLoading} user={user} />
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
              + Add Folder
            </button>
          </div>
          <FolderTable
            folders={folders}
            getKeywords={folder => linkedFilter(folder.id)?.keywords || ''}
            onEdit={openEditFolder}
            onDelete={deleteFolder}
          />
        </section>

        {/* Auto-sort */}
        <section className="card section-card">
          <div className="card-head"><h2>Auto-sort</h2></div>
          <div className="priority-row">
            <div className="auto-sort">
              <span className="auto-sort-label">
                Automatically sort incoming emails into folders based on keywords
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
      <Toast message={toast} onDone={() => setToast('')} />
    </main>
  )
}

function GmailStatus({ loading, user }) {
  if (loading) {
    return (
      <div className="gmail-status checking">
        <span className="gs-dot" />
        <span className="gs-text">Checking connection…</span>
      </div>
    )
  }
  if (user?.connected) {
    return (
      <div className="gmail-status connected">
        <span className="gs-dot" />
        <span className="gs-text">Connected to Gmail{user.email ? ` · ${user.email}` : ''}</span>
      </div>
    )
  }
  return (
    <div className="gmail-status disconnected">
      <span className="gs-dot" />
      <span className="gs-text">
        Not connected —{' '}
        <a href="/api/auth/google" className="gs-link">Sign in again</a>
      </span>
    </div>
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
