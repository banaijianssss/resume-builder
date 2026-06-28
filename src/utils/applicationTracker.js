const STORAGE_KEY = 'resume_builder_applications_v1'

export const APPLICATION_STATUSES = [
  { id: 'wishlist', label: '意向' },
  { id: 'applied', label: '已投递' },
  { id: 'interview', label: '面试中' },
  { id: 'offer', label: '已拿 Offer' },
  { id: 'rejected', label: '已拒绝' }
]

function normalizeItem(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null
  const company = String(raw.company || '').trim().slice(0, 80)
  const role = String(raw.role || '').trim().slice(0, 80)
  if (!company && !role) return null
  const status = APPLICATION_STATUSES.some((s) => s.id === raw.status) ? raw.status : 'applied'
  return {
    id: String(raw.id || `app-${Date.now()}-${index}`),
    company,
    role,
    status,
    jdText: String(raw.jdText || '').slice(0, 4000),
    notes: String(raw.notes || '').slice(0, 1000),
    appliedAt: raw.appliedAt || new Date().toISOString().slice(0, 10),
    updatedAt: raw.updatedAt || new Date().toISOString()
  }
}

export function loadApplications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeItem).filter(Boolean)
  } catch {
    return []
  }
}

export function saveApplications(items) {
  const normalized = (items || []).map(normalizeItem).filter(Boolean).slice(0, 100)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function addApplication(input) {
  const items = loadApplications()
  const item = normalizeItem({ ...input, id: `app-${Date.now()}` }, items.length)
  if (!item) return items
  const next = [item, ...items]
  return saveApplications(next)
}

export function updateApplication(id, patch) {
  const items = loadApplications()
  const next = items.map((item) =>
    item.id === id
      ? normalizeItem({ ...item, ...patch, id: item.id, updatedAt: new Date().toISOString() })
      : item
  )
  return saveApplications(next)
}

export function removeApplication(id) {
  return saveApplications(loadApplications().filter((item) => item.id !== id))
}

export function countByStatus(items) {
  const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s.id, 0]))
  for (const item of items) counts[item.status] = (counts[item.status] || 0) + 1
  return counts
}