export const STORAGE_KEY = 'resume-builder-data'
export const STORAGE_VERSION = 2
export const BACKUP_HINT_KEY = 'resume-builder-backup-hint-seen'

export function getDefaultLayout() {
  return {
    lineHeight: 1.55,
    themeColor: '#667eea',
    paperPaddingMm: 8
  }
}

export function getEmptyResumeData() {
  return {
    avatar: '',
    name: '',
    email: '',
    phone: '',
    github: '',
    linkedin: '',
    portfolio: '',
    objective: '',
    education: [],
    internship: [],
    project: [],
    campus: [],
    skills: [],
    awards: '',
    hobbies: [],
    selfEval: '',
    customSections: [],
    pageBreakBefore: []
  }
}

export function migrateResumeData(raw) {
  const src = raw && typeof raw === 'object' ? raw : {}
  const d = { ...getEmptyResumeData(), ...src }

  const legacySchool = (src.school || d.school || '').trim()
  if (!Array.isArray(d.education)) {
    d.education = []
  }
  if (legacySchool && d.education.length === 0) {
    d.education = [
      {
        school: src.school || d.school || '',
        major: src.major || d.major || '',
        degree: src.degree || d.degree || '本科',
        graduationYear: src.graduationYear || d.graduationYear || ''
      }
    ]
  }
  delete d.school
  delete d.major
  delete d.degree
  delete d.graduationYear

  if (!Array.isArray(d.customSections)) d.customSections = []
  if (!Array.isArray(d.pageBreakBefore)) d.pageBreakBefore = []

  for (const key of ['internship', 'project', 'campus', 'skills', 'hobbies']) {
    if (!Array.isArray(d[key])) d[key] = []
  }

  return d
}

function createProfilePayload(overrides = {}) {
  return {
    id: overrides.id || `p-${Date.now()}`,
    name: overrides.name || '默认简历',
    resumeData: migrateResumeData(overrides.resumeData),
    activeModules: overrides.activeModules ?? null,
    selectedTemplate: overrides.selectedTemplate ?? 'classic',
    moduleOrder: overrides.moduleOrder ?? null,
    fontSize: overrides.fontSize ?? 11,
    layout: { ...getDefaultLayout(), ...(overrides.layout || {}) }
  }
}

export function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return normalizeAppState(JSON.parse(raw))
  } catch {
    return null
  }
}

export function normalizeAppState(parsed) {
  if (!parsed || typeof parsed !== 'object') return null

  // v2 多简历
  if (parsed.profiles && typeof parsed.profiles === 'object') {
    const profiles = Object.fromEntries(
      Object.entries(parsed.profiles).map(([id, p]) => [
        id,
        normalizeProfile(p, id)
      ])
    )
    const activeProfileId =
      parsed.activeProfileId && profiles[parsed.activeProfileId]
        ? parsed.activeProfileId
        : Object.keys(profiles)[0]
    return {
      version: STORAGE_VERSION,
      activeProfileId,
      profiles
    }
  }

  // v1 单份 → 迁入 default 档案
  const legacy = normalizeLegacySingle(parsed)
  return {
    version: STORAGE_VERSION,
    activeProfileId: 'default',
    profiles: {
      default: legacy
    }
  }
}

function normalizeLegacySingle(parsed) {
  return normalizeProfile(
    {
      name: '默认简历',
      resumeData: parsed.resumeData,
      activeModules: parsed.activeModules,
      selectedTemplate: parsed.selectedTemplate,
      moduleOrder: parsed.moduleOrder,
      fontSize: parsed.fontSize,
      layout: parsed.layout
    },
    'default'
  )
}

function normalizeProfile(p, id) {
  if (!p || typeof p !== 'object') {
    return createProfilePayload({ id, name: '未命名简历' })
  }
  return {
    id: p.id || id,
    name: typeof p.name === 'string' ? p.name : '未命名简历',
    resumeData: migrateResumeData(p.resumeData),
    activeModules: Array.isArray(p.activeModules) ? p.activeModules : null,
    selectedTemplate: typeof p.selectedTemplate === 'string' ? p.selectedTemplate : 'classic',
    moduleOrder: Array.isArray(p.moduleOrder) ? p.moduleOrder : null,
    fontSize: typeof p.fontSize === 'number' ? p.fontSize : 11,
    layout: { ...getDefaultLayout(), ...(p.layout && typeof p.layout === 'object' ? p.layout : {}) }
  }
}

export function buildPersistedAppState({ activeProfileId, profiles }) {
  return {
    version: STORAGE_VERSION,
    activeProfileId,
    profiles
  }
}

export function profileToExportShape(profile) {
  return {
    version: STORAGE_VERSION,
    resumeData: profile.resumeData,
    activeModules: profile.activeModules,
    selectedTemplate: profile.selectedTemplate,
    moduleOrder: profile.moduleOrder,
    fontSize: profile.fontSize,
    layout: profile.layout
  }
}

/** @param {unknown} state */
export function validateImportState(state) {
  if (!state || typeof state !== 'object') return false
  const s = /** @type {Record<string, unknown>} */ (state)

  if (s.profiles && typeof s.profiles === 'object') return true

  if (!s.resumeData || typeof s.resumeData !== 'object') return false
  if (s.activeModules !== undefined && !Array.isArray(s.activeModules)) return false
  if (s.moduleOrder !== undefined && !Array.isArray(s.moduleOrder)) return false
  if (s.fontSize !== undefined && typeof s.fontSize !== 'number') return false
  if (s.selectedTemplate !== undefined && typeof s.selectedTemplate !== 'string') return false
  return true
}

export function importToAppState(parsed) {
  if (parsed.profiles && typeof parsed.profiles === 'object') {
    return normalizeAppState(parsed)
  }
  return {
    version: STORAGE_VERSION,
    activeProfileId: 'default',
    profiles: {
      default: normalizeProfile(
        {
          name: '导入的简历',
          resumeData: parsed.resumeData,
          activeModules: parsed.activeModules,
          selectedTemplate: parsed.selectedTemplate,
          moduleOrder: parsed.moduleOrder,
          fontSize: parsed.fontSize,
          layout: parsed.layout
        },
        'default'
      )
    }
  }
}

// 兼容旧引用
export function loadState() {
  const app = loadAppState()
  if (!app) return null
  const p = app.profiles[app.activeProfileId]
  if (!p) return null
  return {
    version: app.version,
    resumeData: p.resumeData,
    activeModules: p.activeModules,
    selectedTemplate: p.selectedTemplate,
    moduleOrder: p.moduleOrder,
    fontSize: p.fontSize,
    layout: p.layout
  }
}

export function normalizeLoadedState(parsed) {
  return loadState()
}

export function buildPersistedState(fields) {
  return profileToExportShape({
    resumeData: fields.resumeData,
    activeModules: fields.activeModules,
    selectedTemplate: fields.selectedTemplate,
    moduleOrder: fields.moduleOrder,
    fontSize: fields.fontSize,
    layout: fields.layout || getDefaultLayout()
  })
}
