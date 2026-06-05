const FREE_PROFILE_LIMIT_FALLBACK = 2
const LOCKED_TEMPLATE_IDS = ['creative', 'sidebar', 'timeline']

function toNumber(value, fallback) {
  const num = Number(value)
  return Number.isFinite(num) && num > 0 ? num : fallback
}

export const proEnabled = import.meta.env.VITE_PRO_ENABLED === 'true'
export const freeProfileLimit = toNumber(
  import.meta.env.VITE_FREE_PROFILE_LIMIT,
  FREE_PROFILE_LIMIT_FALLBACK
)
export const contactUrl = (import.meta.env.VITE_CONTACT_URL || 'mailto:hello@example.com').trim()

export function isTemplateLocked(templateId, isPro) {
  if (isPro) return false
  return LOCKED_TEMPLATE_IDS.includes(templateId)
}

export function getLockedTemplateIds(isPro) {
  if (isPro) return []
  return [...LOCKED_TEMPLATE_IDS]
}
