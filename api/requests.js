import { ConfigError, callScript } from './_lib/script.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { requests } = await callScript({ action: 'list' })
    return res.status(200).json({ requests })
  } catch (err) {
    const status = err instanceof ConfigError ? 500 : 502
    return res.status(status).json({ error: err.message || 'Failed to load requests' })
  }
}
