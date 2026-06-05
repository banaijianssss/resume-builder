import crypto from 'node:crypto'

const DAY_MS = 24 * 60 * 60 * 1000
const DEFAULT_TOKEN_DAYS = 3650

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4)
  return Buffer.from(normalized + padding, 'base64').toString('utf8')
}

function sign(content, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(content)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function getExpiryMs() {
  const days = Number(process.env.PRO_TOKEN_EXPIRES_DAYS || DEFAULT_TOKEN_DAYS)
  const safeDays = Number.isFinite(days) && days > 0 ? days : DEFAULT_TOKEN_DAYS
  return safeDays * DAY_MS
}

export function issueProToken({ sessionId, email }) {
  const secret = process.env.PRO_TOKEN_SECRET
  if (!secret) throw new Error('Missing PRO_TOKEN_SECRET')

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64UrlEncode(
    JSON.stringify({
      sessionId,
      email: email || '',
      iat: Date.now(),
      exp: Date.now() + getExpiryMs(),
      plan: 'pro'
    })
  )
  const signature = sign(`${header}.${payload}`, secret)
  return `${header}.${payload}.${signature}`
}

export function verifyProToken(token) {
  const secret = process.env.PRO_TOKEN_SECRET
  if (!secret) return { valid: false, reason: 'missing_secret' }
  if (!token || typeof token !== 'string') return { valid: false, reason: 'missing_token' }

  const parts = token.split('.')
  if (parts.length !== 3) return { valid: false, reason: 'format_error' }

  const [header, payload, signature] = parts
  const expected = sign(`${header}.${payload}`, secret)
  if (signature.length !== expected.length) {
    return { valid: false, reason: 'bad_signature' }
  }
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return { valid: false, reason: 'bad_signature' }
  }

  try {
    const data = JSON.parse(base64UrlDecode(payload))
    if (!data?.exp || Date.now() > data.exp) {
      return { valid: false, reason: 'expired' }
    }
    return { valid: true, payload: data }
  } catch {
    return { valid: false, reason: 'payload_error' }
  }
}
