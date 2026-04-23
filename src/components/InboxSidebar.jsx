import { COLORS } from '../data/defaults.js'

const colorHex = name => COLORS.find(c => c.name === name)?.hex || '#9ca3af'

export default function InboxSidebar({ folders, activeFolderId, setFolderId, activePriority, setPriority }) {
  return (
    <>
      <h4 className="side-heading">Folders</h4>
      <button
        className={`side-item ${activeFolderId === '' ? 'on' : ''}`}
        onClick={() => setFolderId('')}
      >All emails</button>
      {folders.map(f => (
        <button
          key={f.id}
          className={`side-item ${activeFolderId === f.id ? 'on' : ''}`}
          onClick={() => setFolderId(cur => cur === f.id ? '' : f.id)}
        >
          <span className="color-dot" style={{ background: colorHex(f.color) }} /> {f.name}
        </button>
      ))}
      <button
        className={`side-item ${activeFolderId === 'uncategorized' ? 'on' : ''}`}
        onClick={() => setFolderId(cur => cur === 'uncategorized' ? '' : 'uncategorized')}
      >Uncategorized</button>

      <h4 className="side-heading">Priority</h4>
      <button
        className={`side-item ${activePriority === '' ? 'on' : ''}`}
        onClick={() => setPriority('')}
      >All priorities</button>
      {['High', 'Medium', 'Low'].map(p => (
        <button
          key={p}
          className={`side-item ${activePriority === p ? 'on' : ''}`}
          onClick={() => setPriority(cur => cur === p ? '' : p)}
        >
          <span className={`r-dot pri-${p.toLowerCase()}`} /> {p}
        </button>
      ))}
    </>
  )
}
