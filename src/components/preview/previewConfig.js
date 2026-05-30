import { availableModules } from '../../data/templates.js'

export const MODULE_LABELS = Object.fromEntries(
  availableModules.map((m) => [m.id, m.label])
)

export const EXPERIENCE_MODULES = {
  internship: { listKey: 'internship', primaryKey: 'company', timelineTag: '实习' },
  project: { listKey: 'project', primaryKey: 'name', timelineTag: '项目' },
  campus: { listKey: 'campus', primaryKey: 'organization', timelineTag: '校园' }
}

export const MODERN_SECTION_TITLES = {
  education: '📚 教育背景',
  internship: '💼 实习经历',
  project: '🚀 项目经历',
  campus: '🎓 校园经历',
  skills: '🛠 技能',
  awards: '🏆 荣誉奖项',
  self_eval: '📝 自我评价',
  hobbies: '❤️ 兴趣爱好',
  custom: '📎 自定义'
}

export const CREATIVE_SECTION_TITLES = {
  education: { en: 'EDUCATION', zh: '教育背景' },
  internship: { en: 'EXPERIENCE', zh: '实习经历' },
  project: { en: 'PROJECTS', zh: '项目经历' },
  campus: { en: 'ACTIVITIES', zh: '校园经历' },
  skills: { en: 'SKILLS', zh: '技能' },
  awards: { en: 'AWARDS', zh: '荣誉奖项' },
  self_eval: { en: 'ABOUT', zh: '自我评价' },
  hobbies: { en: 'HOBBIES', zh: '兴趣爱好' },
  custom: { en: 'MORE', zh: '其他' }
}

export function parseAwards(awards) {
  return (awards || '')
    .split('\n')
    .map((a) => a.trim())
    .filter(Boolean)
}

export function isModuleVisible(moduleId, data, activeModules) {
  if (!activeModules.includes(moduleId)) return false

  switch (moduleId) {
    case 'basic':
      return true
    case 'education':
      return (
        (data.education?.length ?? 0) > 0 &&
        data.education.some((e) => e.school?.trim() || e.major?.trim())
      )
    case 'custom':
      return (
        (data.customSections?.length ?? 0) > 0 &&
        data.customSections.some((s) => s.title?.trim() || s.content?.trim())
      )
    case 'internship':
      return (data.internship?.length ?? 0) > 0
    case 'project':
      return (data.project?.length ?? 0) > 0
    case 'campus':
      return (data.campus?.length ?? 0) > 0
    case 'skills':
      return (data.skills?.length ?? 0) > 0
    case 'awards':
      return parseAwards(data.awards).length > 0
    case 'hobbies':
      return (data.hobbies?.length ?? 0) > 0
    case 'self_eval':
      return !!(data.selfEval || '').trim()
    default:
      return false
  }
}

export function getOrderedModuleIds(activeModules, moduleOrder) {
  if (!moduleOrder.length) return [...activeModules]
  return activeModules.slice().sort((a, b) => {
    const ia = moduleOrder.indexOf(a)
    const ib = moduleOrder.indexOf(b)
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
  })
}

/** 侧栏模板左侧固定展示的模块 */
/** 侧栏左侧：技能与兴趣；基本信息在顶部通栏展示 */
export const SIDEBAR_LEFT_IDS = ['skills', 'hobbies']

/** 模板布局类型 */
export const TEMPLATE_LAYOUT = {
  classic: 'standard',
  modern: 'standard',
  creative: 'standard',
  sidebar: 'sidebar',
  timeline: 'timeline'
}

export function getTemplateLayout(templateId) {
  return TEMPLATE_LAYOUT[templateId] || 'standard'
}

export function filterVisibleModules(moduleIds, data, activeModules) {
  return moduleIds.filter((id) => isModuleVisible(id, data, activeModules))
}

export function getSidebarLeftModuleIds(data, activeModules) {
  return filterVisibleModules(SIDEBAR_LEFT_IDS, data, activeModules)
}

export function getSidebarMainModuleIds(orderedModuleIds, data, activeModules) {
  return orderedModuleIds.filter(
    (id) => !SIDEBAR_LEFT_IDS.includes(id) && isModuleVisible(id, data, activeModules)
  )
}

export function getTimelineBodyModuleIds(orderedModuleIds, data, activeModules) {
  return orderedModuleIds.filter(
    (id) => id !== 'basic' && isModuleVisible(id, data, activeModules)
  )
}
