import { verifyProToken } from './_lib/proToken.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  let body = request.body || {}
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}')
    } catch {
      response.status(400).json({ error: 'Invalid JSON body' })
      return
    }
  }

  const token = body.proToken
  const result = verifyProToken(token)

  if (!result.valid) {
    response.status(401).json({ valid: false, reason: result.reason })
    return
  }

  response.status(200).json({
    valid: true,
    plan: result.payload.plan,
    exp: result.payload.exp,
    email: result.payload.email || ''
  })
}