import { timingSafeEqual } from 'node:crypto'
import { ConfigError, callScript } from './_lib/script.js'

const ALLOWED = ['Approved', 'Rejected']

function passcodeMatches(given) {
  const expected = process.env.APPROVER_PASSCODE
  if (!expected) throw new ConfigError('APPROVER_PASSCODE is not set')
  const a = Buffer.from(String(given ?? ''))
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { tab, row, requester, status, passcode } = req.body || {}

    if (!passcodeMatches(passcode)) {
      return res.status(401).json({ error: 'Incorrect approver passcode' })
    }
    if (!ALLOWED.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${ALLOWED.join(', ')}` })
    }
    if (typeof tab !== 'string' || !Number.isInteger(row) || row < 1) {
      return res.status(400).json({ error: 'tab and row are required' })
    }

    // The script re-checks that the row still holds the same Pending request before writing.
    const result = await callScript({ action: 'setStatus', tab, row, requester, status })
    return res.status(200).json(result)
  } catch (err) {
    const code = err instanceof ConfigError ? 500 : [400, 404, 409].includes(err.code) ? err.code : 502
    return res.status(code).json({ error: err.message || 'Failed to update status' })
  }
}
