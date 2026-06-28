import { kvConfigured, kvSet } from '../_lib/kv.js'
import { randomBytes } from 'node:crypto'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method Not Allowed' })
    return
  }
  if (!kvConfigured()) {
    response.status(503).json({ error: 'Cloud sync not configured (UPSTASH_REDIS_REST_URL)' })
    return
  }

  let body = request.body || {}
  if (typeof body === 'string') {
    try { body = JSON.parse(body || '{}') } catch {
      response.status(400).json({ error: 'Invalid JSON' })
      return
    }
  }

  const payload = body.payload
  if (!payload || typeof payload !== 'object') {
    response.status(400).json({ error: 'Missing payload' })
    return
  }

  const syncCode = body.syncCode || randomBytes(4).toString('hex')
  await kvSet(`rb:sync:${syncCode}`, JSON.stringify(payload))
  response.status(200).json({ syncCode, savedAt: Date.now() })
}