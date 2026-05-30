export const STORAGE_KEY = 'resume-builder-data'
export const STORAGE_VERSION = 1

export function getEmptyResumeData() {
  return {
    avatar: '',
    name: '',
    email: '',
    phone: '',
    school: '',
    major: '',
    degree: '本科',
    graduationYear: '',
    objective: '',
    internship: [],
    project: [],
    campus: [],
    skills: [],
    awards: '',
    hobbies: [],
    selfEval: ''
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return normalizeLoadedState(parsed)
  } catch {
    return null
  }
}

export function normalizeLoadedState(parsed) {
  if (!parsed || typeof parsed !== 'object') return null

  const resumeData =
    parsed.resumeData && typeof parsed.resumeData === 'object'
      ? { ...getEmptyResumeData(), ...parsed.resumeData }
      : getEmptyResumeData()

  return {
    version: parsed.version ?? STORAGE_VERSION,
    resumeData,
    activeModules: Array.isArray(parsed.activeModules) ? parsed.activeModules : null,
    selectedTemplate:
      typeof parsed.selectedTemplate === 'string' ? parsed.selectedTemplate : null,
    moduleOrder: Array.isArray(parsed.moduleOrder) ? parsed.moduleOrder : null,
    fontSize: typeof parsed.fontSize === 'number' ? parsed.fontSize : null
  }
}

export function buildPersistedState({
  resumeData,
  activeModules,
  selectedTemplate,
  moduleOrder,
  fontSize
}) {
  return {
    version: STORAGE_VERSION,
    resumeData,
    activeModules,
    selectedTemplate,
    moduleOrder,
    fontSize
  }
}

/** @param {unknown} state */
export function validateImportState(state) {
  if (!state || typeof state !== 'object') return false
  const s = /** @type {Record<string, unknown>} */ (state)
  if (!s.resumeData || typeof s.resumeData !== 'object') return false
  if (s.activeModules !== undefined && !Array.isArray(s.activeModules)) return false
  if (s.moduleOrder !== undefined && !Array.isArray(s.moduleOrder)) return false
  if (s.fontSize !== undefined && typeof s.fontSize !== 'number') return false
  if (s.selectedTemplate !== undefined && typeof s.selectedTemplate !== 'string') return false
  return true
}
