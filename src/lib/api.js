import { SAMPLE } from './sample.js'

// Returns { demo, requests }. When the API is not reachable (plain Vite dev
// server) the app falls back to sample data so the UI can still be explored.
export async function fetchRequests() {
  let res
  try {
    res = await fetch('/api/requests')
  } catch {
    return { demo: true, requests: SAMPLE }
  }
  const type = res.headers.get('content-type') || ''
  if (res.status === 404 || !type.includes('application/json')) {
    return { demo: true, requests: SAMPLE }
  }
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`)
  return { demo: false, requests: body.requests }
}

export async function updateStatus(request, status, passcode) {
  const res = await fetch('/api/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tab: request.tab,
      row: request.row,
      requester: request.requester,
      status,
      passcode,
    }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(body.error || `Update failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return body
}
