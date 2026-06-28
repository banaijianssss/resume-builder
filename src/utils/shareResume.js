function toBase64Url(json) {
  const raw = JSON.stringify(json)
  const b64 = btoa(unescape(encodeURIComponent(raw)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(token) {
  const b64 = token.replace(/-/g, '+').replace(/_/g, '/')
  const pad = '='.repeat((4 - (b64.length % 4)) % 4)
  const raw = decodeURIComponent(escape(atob(b64 + pad)))
  return JSON.parse(raw)
}

export async function buildShareUrl(profileExportShape, baseUrl = window.location.origin) {
  const { ok, data } = await fetch('/api/share/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload: profileExportShape })
  }).then(async (res) => ({ ok: res.ok, data: await res.json().catch(() => ({})) }))

  if (ok && data.shareId) {
    return `${baseUrl}/share.html?id=${data.shareId}`
  }

  const token = toBase64Url(profileExportShape)
  return `${baseUrl}/share.html#${token}`
}

export function parseSharePayload(hash = '') {
  const token = (hash || '').replace(/^#/, '').trim()
  if (!token) return null
  try {
    return fromBase64Url(token)
  } catch {
    return null
  }
}

export async function fetchShareViews(shareId) {
  const res = await fetch('/api/share/view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shareId })
  })
  const data = await res.json().catch(() => ({}))
  return data.views
}