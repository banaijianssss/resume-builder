import { trackEvent } from './analytics.js'

const PRO_TOKEN_KEY = 'resume-builder-pro-token'

function getQueryParam(name) {
  if (typeof window === 'undefined') return ''
  const value = new URLSearchParams(window.location.search).get(name)
  return (value || '').trim()
}

export function getStoredProToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(PRO_TOKEN_KEY) || ''
}

export function setStoredProToken(token) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PRO_TOKEN_KEY, token)
}

export function clearStoredProToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PRO_TOKEN_KEY)
}

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data }
}

export async function verifyStoredProToken() {
  const token = getStoredProToken()
  if (!token) return { isPro: false }

  const { ok, data } = await postJson('/api/verify-pro-token', { proToken: token })
  if (!ok || !data.valid) {
    clearStoredProToken()
    return { isPro: false }
  }
  return { isPro: true, profile: data }
}

export async function activateProFromUrlIfNeeded() {
  const checkout = getQueryParam('checkout')
  const sessionId = getQueryParam('session_id')
  if (checkout !== 'success' || !sessionId) {
    return { activated: false }
  }

  const { ok, data } = await postJson('/api/activate-pro', { sessionId })
  if (!ok || !data.proToken) {
    trackEvent('pro_activate_failed', { reason: data?.error || 'unknown' })
    return { activated: false, error: data?.error || '激活失败' }
  }

  setStoredProToken(data.proToken)
  const url = new URL(window.location.href)
  url.searchParams.delete('checkout')
  url.searchParams.delete('session_id')
  window.history.replaceState({}, '', url.toString())
  trackEvent('pro_activated', { email: data.email || '' })
  return { activated: true }
}

export async function createCheckoutSession(mode = 'lifetime') {
  const endpoint = mode === 'subscription'
    ? '/api/create-checkout-subscription'
    : '/api/create-checkout-session'
  const { ok, data } = await postJson(endpoint, {})
  if (!ok || !data.url) {
    throw new Error(data?.error || '创建支付链接失败')
  }
  return data.url
}
