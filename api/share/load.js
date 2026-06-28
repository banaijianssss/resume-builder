import { kvConfigured, kvGet } from '../_lib/kv.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  let body = request.body || {}
  if (typeof body === 'string') {
    try { body = JSON.parse(body || '{}') } catch {
      response.status(400).json({ error: 'Invalid JSON' })
      return
    }
  }

  const shareId = String(body.shareId || '').trim()
  if (!shareId || !kvConfigured()) {
    response.status(404).json({ error: 'Not found' })
    return
  }

  const raw = await kvGet(`rb:share:${shareId}`)
  if (!raw) {
    response.status(404).json({ error: 'Share expired' })
    return
  }

  response.status(200).json({ payload: JSON.parse(raw) })
}