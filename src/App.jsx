import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'inboxflow-v1'

const seed = {
  folders: ['Inbox', 'Work', 'Personal'],
  filters: [
    { keyword: 'invoice', folder: 'Work', priority: 'High' },
    { keyword: 'newsletter', folder: 'Personal', priority: 'Low' },
  ],
  emails: [
    { id: 1, from: 'boss@company.com', subject: 'Q2 invoice review', body: 'Please review the attached invoice before Friday.', date: '2026-04-21' },
    { id: 2, from: 'news@daily.com', subject: 'Your weekly newsletter', body: 'Top stories this week...', date: '2026-04-20' },
    { id: 3, from: 'mom@family.com', subject: 'Dinner Sunday?', body: 'Let me know if you can make it.', date: '2026-04-22' },
    { id: 4, from: 'hr@company.com', subject: 'Benefits enrollment', body: 'Open enrollment closes next month.', date: '2026-04-19' },
  ],
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return seed
}

function applyFilters(email, filters) {
  const text = `${email.subject} ${email.body} ${email.from}`.toLowerCase()
  for (const f of filters) {
    if (f.keyword && text.includes(f.keyword.toLowerCase())) {
      return { folder: f.folder, priority: f.priority }
    }
  }
  return { folder: 'Inbox', priority: 'Medium' }
}

export default function App() {
  const [data, setData] = useState(load)
  const [activeFolder, setActiveFolder] = useState('Inbox')
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [newFolder, setNewFolder] = useState('')
  const [fKeyword, setFKeyword] = useState('')
  const [fFolder, setFFolder] = useState('Inbox')
  const [fPriority, setFPriority] = useState('Medium')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const enriched = useMemo(
    () => data.emails.map(e => ({ ...e, ...applyFilters(e, data.filters) })),
    [data.emails, data.filters]
  )

  const counts = useMemo(() => {
    const c = {}
    for (const f of data.folders) c[f] = 0
    for (const e of enriched) c[e.folder] = (c[e.folder] || 0) + 1
    return c
  }, [enriched, data.folders])

  const visible = enriched
    .filter(e => e.folder === activeFolder)
    .filter(e => priorityFilter === 'All' || e.priority === priorityFilter)
    .filter(e => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        e.subject.toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q) ||
        e.from.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const order = { High: 0, Medium: 1, Low: 2 }
      return order[a.priority] - order[b.priority]
    })

  const addFolder = () => {
    const name = newFolder.trim()
    if (!name || data.folders.includes(name)) return
    setData(d => ({ ...d, folders: [...d.folders, name] }))
    setNewFolder('')
  }

  const addFilter = () => {
    if (!fKeyword.trim()) return
    setData(d => ({
      ...d,
      filters: [...d.filters, { keyword: fKeyword.trim(), folder: fFolder, priority: fPriority }],
    }))
    setFKeyword('')
  }

  const removeFilter = (i) => {
    setData(d => ({ ...d, filters: d.filters.filter((_, idx) => idx !== i) }))
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>📬 InboxFlow</h1>
        <ul>
          {data.folders.map(f => (
            <li
              key={f}
              className={f === activeFolder ? 'active' : ''}
              onClick={() => setActiveFolder(f)}
            >
              <span>{f}</span>
              <span style={{ opacity: 0.6, fontSize: 12 }}>{counts[f] || 0}</span>
            </li>
          ))}
        </ul>
        <div className="section">
          <h3>New folder</h3>
          <input
            placeholder="Folder name"
            value={newFolder}
            onChange={e => setNewFolder(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addFolder()}
          />
          <button onClick={addFolder}>Add folder</button>
        </div>
        <div className="section">
          <h3>New filter</h3>
          <input placeholder="Keyword" value={fKeyword} onChange={e => setFKeyword(e.target.value)} />
          <select value={fFolder} onChange={e => setFFolder(e.target.value)} style={{ width: '100%', marginTop: 6, padding: 6 }}>
            {data.folders.map(f => <option key={f}>{f}</option>)}
          </select>
          <select value={fPriority} onChange={e => setFPriority(e.target.value)} style={{ width: '100%', marginTop: 6, padding: 6 }}>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
          <button onClick={addFilter}>Add filter</button>
        </div>
      </aside>

      <main className="main">
        <h2>{activeFolder}</h2>
        <div className="toolbar">
          <input
            className="search"
            placeholder="Search emails..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option>All</option><option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>

        {data.filters.length > 0 && (
          <div className="filters">
            <strong style={{ fontSize: 13 }}>Active filters:</strong>
            {data.filters.map((f, i) => (
              <div className="filter-row" key={i}>
                <span>"{f.keyword}"</span> → <span>{f.folder}</span> · <span>{f.priority}</span>
                <button className="del" onClick={() => removeFilter(i)}>×</button>
              </div>
            ))}
          </div>
        )}

        {visible.length === 0 ? (
          <div className="empty">No emails match.</div>
        ) : (
          visible.map(e => (
            <div key={e.id} className={`email ${e.priority.toLowerCase()}`}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{e.subject}</strong>
                  <span className={`priority-badge ${e.priority.toLowerCase()}`}>{e.priority}</span>
                </div>
                <div className="email-meta">{e.from} · {e.date}</div>
                <div className="email-body">{e.body}</div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}
