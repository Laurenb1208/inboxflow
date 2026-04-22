import { useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { COLORS, DEFAULT_SETTINGS } from '../data/defaults.js'
import FolderModal from '../components/FolderModal.jsx'
import FilterModal from '../components/FilterModal.jsx'
import Toast from '../components/Toast.jsx'

const STORAGE_KEY = 'inboxflow-settings-v2'

const uid = () => Math.random().toString(36).slice(2, 10)

export default function Settings() {
  const [stored, setStored] = useLocalStorage(STORAGE_KEY, DEFAULT_SETTINGS)
  const [draft, setDraft] = useState(stored)
  const [folderModal, setFolderModal] = useState({ open: false, initial: null })
  const [filterModal, setFilterModal] = useState({ open: false, initial: null })
  const [toast, setToast] = useState('')

  const dirty = JSON.stringify(draft) !== JSON.stringify(stored)
  const colorHex = name => COLORS.find(c => c.name === name)?.hex || '#9ca3af'

  const saveAll = () => {
    setStored(draft)
    setToast('Changes saved')
  }
  const resetAll = () => {
    setDraft(DEFAULT_SETTINGS)
    setStored(DEFAULT_SETTINGS)
    setToast('Reset to defaults')
  }

  // Folder ops
  const upsertFolder = (f) => {
    setDraft(d => {
      if (f.id) return { ...d, folders: d.folders.map(x => x.id === f.id ? f : x) }
      return { ...d, folders: [...d.folders, { ...f, id: uid() }] }
    })
  }
  const deleteFolder = (id) => {
    setDraft(d => ({ ...d, folders: d.folders.filter(x => x.id !== id) }))
  }

  // Filter ops
  const upsertFilter = (f) => {
    setDraft(d => {
      if (f.id) return { ...d, filters: d.filters.map(x => x.id === f.id ? f : x) }
      return { ...d, filters: [...d.filters, { ...f, id: uid() }] }
    })
  }
  const deleteFilter = (id) => {
    setDraft(d => ({ ...d, filters: d.filters.filter(x => x.id !== id) }))
  }

  return (
    <main className="settings-page">
      <div className="container">
        <div className="settings-bar">
          <div className="bar-left">
            <button className="btn btn-primary btn-sm">Sync Now</button>
            <button className="btn btn-ghost btn-sm">Return to Email</button>
          </div>
          <div className="bar-center">
            <h1>InboxFlow Settings <span className="check">✓</span></h1>
            <div className="connected">— Connected to Gmail</div>
          </div>
          <div className="bar-right">
            {dirty && <span className="unsaved">Unsaved changes</span>}
          </div>
        </div>

        <div className="permission-note">
          🔒 You're granting permission for email organization only. InboxFlow never sends replies or replaces your email provider.
        </div>

        {/* Folders */}
        <section className="card section-card">
          <div className="card-head">
            <h2>Folders</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setFolderModal({ open: true, initial: null })}>
              + Create or Edit
            </button>
          </div>
          {draft.folders.length === 0 ? (
            <EmptyState
              icon="📂"
              title="No folders yet"
              hint="Create your first folder to start organizing emails."
              cta="Add folder"
              onClick={() => setFolderModal({ open: true, initial: null })}
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Folder Name</th>
                  <th>Color</th>
                  <th>Priority</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {draft.folders.map(f => (
                  <tr key={f.id}>
                    <td>{f.name}</td>
                    <td>
                      <span className="color-cell">
                        <span className="color-dot" style={{ background: colorHex(f.color) }} />
                        {f.color}
                      </span>
                    </td>
                    <td><span className={`pri-pill pri-${f.priority.toLowerCase()}`}>{f.priority}</span></td>
                    <td className="right">
                      <button className="link-btn" onClick={() => setFolderModal({ open: true, initial: f })}>Edit</button>
                      <button className="link-btn danger" onClick={() => deleteFolder(f.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Filters */}
        <section className="card section-card">
          <div className="card-head">
            <h2>Filters &amp; Rules</h2>
            <button
              className="btn btn-primary btn-sm"
              disabled={draft.folders.length === 0}
              title={draft.folders.length === 0 ? 'Create a folder first' : ''}
              onClick={() => setFilterModal({ open: true, initial: null })}
            >
              + Create or Edit
            </button>
          </div>
          {draft.filters.length === 0 ? (
            <EmptyState
              icon="🎯"
              title="No filters yet"
              hint="Add a filter to route incoming emails into the right folder."
              cta="Add filter"
              onClick={() => setFilterModal({ open: true, initial: null })}
            />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Filter Name</th>
                  <th>Keywords</th>
                  <th>Folder Name</th>
                  <th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {draft.filters.map(f => (
                  <tr key={f.id}>
                    <td>{f.name}</td>
                    <td className="kw">{f.keywords}</td>
                    <td>{f.folder}</td>
                    <td className="right">
                      <button className="link-btn" onClick={() => setFilterModal({ open: true, initial: f })}>Edit</button>
                      <button className="link-btn danger" onClick={() => deleteFilter(f.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Priority Tags */}
        <section className="card section-card">
          <div className="card-head">
            <h2>Priority Tags</h2>
          </div>
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
                <input
                  type="checkbox"
                  checked={draft.autoSort}
                  onChange={e => setDraft(d => ({ ...d, autoSort: e.target.checked }))}
                />
                <span className="slider" />
                <span className="switch-text">{draft.autoSort ? 'ON' : 'OFF'}</span>
              </label>
            </div>
          </div>
        </section>

        <div className="action-row">
          <button className="btn btn-primary btn-lg" onClick={saveAll} disabled={!dirty}>Save Changes</button>
          <button className="btn btn-ghost btn-lg" onClick={resetAll}>Reset</button>
        </div>
      </div>

      <FolderModal
        open={folderModal.open}
        initial={folderModal.initial}
        onClose={() => setFolderModal({ open: false, initial: null })}
        onSave={upsertFolder}
      />
      <FilterModal
        open={filterModal.open}
        initial={filterModal.initial}
        folders={draft.folders}
        onClose={() => setFilterModal({ open: false, initial: null })}
        onSave={upsertFilter}
      />
      <Toast message={toast} onDone={() => setToast('')} />
    </main>
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
