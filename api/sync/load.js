import { kvConfigured, kvGet } from '../_lib/kv.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  if (!kvConfigured()) {
    response.status(503).json({ error: 'Cloud sync not configured' })
    return
  }

  let body = request.body || {}
  if (typeof body === 'string') {
    try { body = JSON.parse(body || '{}') } catch {
      response.status(400).json({ error: 'Invalid JSON' })
      return
    }
  }

  const syncCode = String(body.syncCode || '').trim()
  if (!syncCode) {
    response.status(400).json({ error: 'Missing syncCode' })
    return
  }

  const raw = await kvGet(`rb:sync:${syncCode}`)
  if (!raw) {
    response.status(404).json({ error: 'Sync code not found or expired' })
    return
  }

  response.status(200).json({ payload: JSON.parse(raw), syncCode })
}