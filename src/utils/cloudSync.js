async function postJson(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, data }
}

export async function saveToCloud(payload, syncCode) {
  return postJson('/api/sync/save', { payload, syncCode })
}

export async function loadFromCloud(syncCode) {
  return postJson('/api/sync/load', { syncCode })
}