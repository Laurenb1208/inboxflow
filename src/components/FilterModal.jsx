import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import { PRIORITIES } from '../data/defaults.js'

export default function FilterModal({ open, onClose, onSave, initial, folders }) {
  const [name, setName] = useState('')
  const [keywords, setKeywords] = useState('')
  const [folder, setFolder] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setName(initial?.name || '')
      setKeywords(initial?.keywords || '')
      setFolder(initial?.folder || folders[0]?.name || '')
      setPriority(initial?.priority || 'Medium')
      setError('')
    }
  }, [open, initial, folders])

  const submit = e => {
    e.preventDefault()
    if (!name.trim()) return setError('Filter name is required')
    if (!keywords.trim()) return setError('At least one keyword is required')
    if (!folder) return setError('Please select a folder')
    onSave({ ...(initial || {}), name: name.trim(), keywords: keywords.trim(), folder, priority })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Filter' : 'Create Filter'}>
      <form onSubmit={submit}>
        <label className="field">
          <span>Filter Name</span>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Meetings" autoFocus />
        </label>
        <label className="field">
          <span>Keywords</span>
          <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="Comma Separated" />
          <small className="hint">Separate keywords with commas (e.g. zoom, calendar)</small>
        </label>
        <label className="field">
          <span>Folder</span>
          <select value={folder} onChange={e => setFolder(e.target.value)}>
            <option value="">Select Folder</option>
            {folders.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
          </select>
        </label>
        <fieldset className="field">
          <span>Priority</span>
          <div className="radio-row">
            {PRIORITIES.map(p => (
              <label key={p} className={`radio-pill pri-${p.toLowerCase()} ${priority === p ? 'on' : ''}`}>
                <input type="radio" name="fpri" checked={priority === p} onChange={() => setPriority(p)} />
                <span className="r-dot" /> {p}
              </label>
            ))}
          </div>
        </fieldset>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="btn btn-primary btn-block">Save Changes</button>
      </form>
    </Modal>
  )
}
