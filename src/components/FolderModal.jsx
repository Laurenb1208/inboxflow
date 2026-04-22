import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import { COLORS, PRIORITIES } from '../data/defaults.js'

export default function FolderModal({ open, onClose, onSave, initial }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('Blue')
  const [priority, setPriority] = useState('High')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setName(initial?.name || '')
      setColor(initial?.color || 'Blue')
      setPriority(initial?.priority || 'High')
      setError('')
    }
  }, [open, initial])

  const submit = e => {
    e.preventDefault()
    if (!name.trim()) return setError('Folder name is required')
    onSave({ ...(initial || {}), name: name.trim(), color, priority })
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
        <fieldset className="field">
          <span>Priority</span>
          <div className="radio-row">
            {PRIORITIES.map(p => (
              <label key={p} className={`radio-pill pri-${p.toLowerCase()} ${priority === p ? 'on' : ''}`}>
                <input type="radio" name="pri" checked={priority === p} onChange={() => setPriority(p)} />
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
