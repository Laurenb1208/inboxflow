import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import { COLORS } from '../data/defaults.js'

export default function FolderModal({ open, onClose, onSave, initial }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('Blue')
  const [keywords, setKeywords] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setName(initial?.name || '')
      setColor(initial?.color || 'Blue')
      setKeywords(initial?.keywords || '')
      setError('')
    }
  }, [open, initial])

  const submit = e => {
    e.preventDefault()
    if (!name.trim()) return setError('Folder name is required')
    onSave({ ...(initial || {}), name: name.trim(), color, keywords: keywords.trim() })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Folder' : 'Create Folder'}>
      <form onSubmit={submit}>
        <label className="field">
          <span>Folder Name</span>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Meetings" autoFocus />
        </label>
        <label className="field">
          <span>Select Color</span>
          <div className="color-select">
            <span className="color-dot" style={{ background: COLORS.find(c => c.name === color)?.hex }} />
            <select value={color} onChange={e => setColor(e.target.value)}>
              {COLORS.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </label>
        <label className="field">
          <span>Keywords</span>
          <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g. zoom, calendar, invite" />
          <small className="hint">Emails matching any keyword will be sorted into this folder</small>
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="btn btn-primary btn-block">Save Changes</button>
      </form>
    </Modal>
  )
}
