export function kvConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

async function kvFetch(path, init) {
  const url = process.env.UPSTASH_REDIS_REST_URL + path
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      ...(init?.headers || {})
    }
  })
  if (!res.ok) throw new Error(`KV ${res.status}`)
  return res.json()
}

export async function kvGet(key) {
  const data = await kvFetch(`/get/${encodeURIComponent(key)}`)
  return data.result ?? null
}

export async function kvSet(key, value, ttlSeconds = 60 * 60 * 24 * 30) {
  await kvFetch(`/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}?EX=${ttlSeconds}`, {
    method: 'POST'
  })
}

export async function kvIncr(key) {
  const data = await kvFetch(`/incr/${encodeURIComponent(key)}`, { method: 'POST' })
  return Number(data.result || 0)
}