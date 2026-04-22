export const COLORS = [
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#f59e0b' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Gray', hex: '#6b7280' },
]

export const PRIORITIES = ['High', 'Medium', 'Low']

export const PRIORITY_COLOR = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
}

export const DEFAULT_SETTINGS = {
  folders: [
    { id: 'f1', name: 'Meetings', color: 'Blue', priority: 'High' },
    { id: 'f2', name: 'Clients', color: 'Green', priority: 'Medium' },
    { id: 'f3', name: 'Internal', color: 'Purple', priority: 'Low' },
  ],
  filters: [
    { id: 'r1', name: 'Meetings', keywords: 'zoom, calendar', folder: 'Meetings', priority: 'High' },
    { id: 'r2', name: 'Clients', keywords: 'contract, proposal', folder: 'Clients', priority: 'Medium' },
    { id: 'r3', name: 'Internal', keywords: 'update, FYI', folder: 'Internal', priority: 'Low' },
  ],
  autoSort: true,
}
