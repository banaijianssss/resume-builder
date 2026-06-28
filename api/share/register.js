import { kvConfigured, kvSet } from '../_lib/kv.js'
import { randomBytes } from 'node:crypto'

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

  const shareId = randomBytes(8).toString('hex')
  const payload = body.payload
  if (!payload) {
    response.status(400).json({ error: 'Missing payload' })
    return
  }

  if (kvConfigured()) {
    await kvSet(`rb:share:${shareId}`, JSON.stringify(payload), 60 * 60 * 24 * 90)
    await kvSet(`rb:share:views:${shareId}`, '0', 60 * 60 * 24 * 90)
  }

  response.status(200).json({ shareId, hasAnalytics: kvConfigured() })
}