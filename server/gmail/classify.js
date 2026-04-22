// Apply user-defined filters to a normalized email object.
// First filter (sorted by rank) whose keyword appears in subject/snippet/sender wins.
// Returns { folderId, priority, matchedFilterId } or all-null if no match.

export function classify(email, userFilters, userFolders) {
  const haystack = [
    email.subject || '',
    email.snippet || '',
    email.fromAddr || '',
    email.fromName || '',
  ].join(' ').toLowerCase()

  const sorted = [...userFilters].sort((a, b) => (a.rank || 0) - (b.rank || 0))
  for (const f of sorted) {
    const keywords = f.keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean)
    const hit = keywords.some(k => k && haystack.includes(k))
    if (hit) {
      const folder = userFolders.find(x => x.id === f.folderId)
      if (folder) {
        return { folderId: folder.id, priority: f.priority, matchedFilterId: f.id }
      }
    }
  }
  return { folderId: null, priority: null, matchedFilterId: null }
}
