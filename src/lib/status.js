export const NO_STATUS = 'No status'

const ALIASES = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
  denied: 'Rejected',
  declined: 'Rejected',
}

const CORE = ['Pending', 'Approved', 'Rejected']

export function normalizeStatus(raw) {
  const text = (raw || '').trim()
  if (!text) return NO_STATUS
  return ALIASES[text.toLowerCase()] || text
}

// Pending, Approved, Rejected always appear (even at 0); any other statuses
// found in the sheet follow by count, with "No status" last.
export function summarize(requests) {
  const counts = new Map(CORE.map((s) => [s, 0]))
  for (const r of requests) {
    const s = normalizeStatus(r.status)
    counts.set(s, (counts.get(s) || 0) + 1)
  }
  const extras = [...counts.keys()]
    .filter((s) => !CORE.includes(s) && s !== NO_STATUS)
    .sort((a, b) => counts.get(b) - counts.get(a))
  const order = [...CORE, ...extras]
  if (counts.has(NO_STATUS)) order.push(NO_STATUS)
  return order.map((status) => ({ status, count: counts.get(status) }))
}
