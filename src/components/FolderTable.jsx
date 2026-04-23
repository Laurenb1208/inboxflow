import { COLORS } from '../data/defaults.js'

const colorHex = name => COLORS.find(c => c.name === name)?.hex || '#9ca3af'

export default function FolderTable({ folders, getKeywords, onEdit, onDelete }) {
  if (folders.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📂</div>
        <h4>No folders yet</h4>
        <p>Create a folder to start automatically sorting your emails.</p>
      </div>
    )
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Folder</th>
            <th>Color</th>
            <th>Priority</th>
            <th>Keywords</th>
            <th className="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {folders.map(folder => (
            <tr key={folder.id}>
              <td>{folder.name}</td>
              <td>
                <span className="color-cell">
                  <span className="color-dot" style={{ background: colorHex(folder.color) }} />
                  {folder.color}
                </span>
              </td>
              <td>
                {folder.priority
                  ? <span className={`pri-pill pri-${folder.priority.toLowerCase()}`}>{folder.priority}</span>
                  : <span className="muted">—</span>}
              </td>
              <td className="kw">{getKeywords(folder) || <span className="muted">—</span>}</td>
              <td className="right">
                <button className="link-btn" onClick={() => onEdit(folder)}>Edit</button>
                <button className="link-btn danger" onClick={() => onDelete(folder.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
