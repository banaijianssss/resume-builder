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

  if (!String(body.html || '').trim()) {
    response.status(400).json({ error: 'Missing html' })
    return
  }

  response.status(503).json({
    error: 'Server HD PDF is unavailable on this deployment. Use client-side PDF export.',
    code: 'SERVER_PDF_UNAVAILABLE'
  })
}