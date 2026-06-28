import { matchSkillsToJd } from './keywordMatch.js'
import { getResumeChecklist } from './resumeValidation.js'
import { buildResumeText } from './resumeToText.js'

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function filledCount(values) {
  return values.filter(hasText).length
}

function nonEmptyItems(items, keys) {
  if (!Array.isArray(items)) return []
  return items.filter((item) => keys.some((key) => hasText(item?.[key])))
}

function clampScore(value, max) {
  return Math.max(0, Math.min(max, Math.round(value)))
}

function makeCheck(id, label, points, max, detail) {
  const ratio = max > 0 ? points / max : 1
  return {
    id,
    label,
    points,
    max,
    detail,
    status: ratio >= 0.8 ? 'good' : ratio >= 0.45 ? 'warn' : 'bad'
  }
}

function scoreBasic(data) {
  let points = 0
  const details = []

  if (hasText(data.name)) points += 5
  else details.push('补充姓名')

  const contact = filledCount([data.email, data.phone])
  points += contact === 2 ? 6 : contact === 1 ? 4 : 0
  if (!contact) details.push('补充邮箱或电话')

  if (hasText(data.objective)) points += 4
  else details.push('补充求职意向')

  const links = filledCount([data.github, data.portfolio, data.linkedin])
  points += links >= 2 ? 5 : links === 1 ? 3 : 0
  if (!links) details.push('可加入 GitHub、作品集或 LinkedIn')

  return makeCheck('basic', '基础信息', points, 20, details.join('；') || '基础信息完整')
}

function scoreEducation(data, activeModules) {
  if (!activeModules.includes('education')) {
    return makeCheck('education', '教育背景', 8, 10, '未启用教育背景模块')
  }

  const list = nonEmptyItems(data.education, ['school', 'major', 'degree', 'graduationYear'])
  if (!list.length) return makeCheck('education', '教育背景', 0, 10, '添加学校、专业和学历')

  const best = Math.max(
    ...list.map((item) => filledCount([item.school, item.major, item.degree, item.graduationYear]))
  )
  return makeCheck('education', '教育背景', clampScore((best / 4) * 10, 10), 10, '教育经历越完整，筛选通过率越稳定')
}

function scoreExperience(data, activeModules) {
  const modules = [
    ['internship', ['company', 'role', 'period', 'description']],
    ['project', ['name', 'role', 'period', 'description']],
    ['campus', ['organization', 'role', 'period', 'description']]
  ]

  let items = []
  for (const [moduleId, keys] of modules) {
    if (activeModules.includes(moduleId)) {
      items = items.concat(nonEmptyItems(data[moduleId], keys))
    }
  }

  if (!items.length) {
    return makeCheck('experience', '经历内容', 0, 25, '添加实习、项目或校园经历')
  }

  const described = items.filter((item) => hasText(item.description))
  const quantified = described.filter((item) => /(\d+|%|倍|人|次|个|项|天|月)/.test(item.description))
  const points = clampScore(
    Math.min(items.length, 3) * 5 + Math.min(described.length, 3) * 4 + Math.min(quantified.length, 2) * 4,
    25
  )
  const detail = quantified.length
    ? '经历包含量化结果'
    : '建议在描述中加入数字、规模或结果'

  return makeCheck('experience', '经历内容', points, 25, detail)
}

function scoreSkills(data, activeModules, jdText) {
  if (!activeModules.includes('skills')) {
    return makeCheck('skills', '技能关键词', 0, 15, '启用技能模块并添加岗位关键词')
  }

  const skills = Array.isArray(data.skills) ? data.skills.filter(hasText) : []
  if (!skills.length) return makeCheck('skills', '技能关键词', 0, 15, '添加 5-8 个核心技能')

  let points = Math.min(skills.length, 8) * 1.2
  const jd = (jdText || '').trim()
  if (jd) {
    const match = matchSkillsToJd(jd, skills)
    points += skills.length ? (match.matched.length / skills.length) * 5.4 : 0
  } else {
    points += 3
  }

  return makeCheck(
    'skills',
    '技能关键词',
    clampScore(points, 15),
    15,
    jd ? '按当前 JD 计算技能命中率' : '粘贴 JD 后可检查岗位匹配度'
  )
}

function scoreAtsText(data, activeModules, moduleOrder) {
  const text = buildResumeText(data, activeModules, moduleOrder).trim()
  const length = text.length
  let points = 0

  if (length >= 500 && length <= 1800) points = 15
  else if (length >= 300 && length < 500) points = 10
  else if (length > 1800 && length <= 2600) points = 11
  else if (length > 0) points = 6

  const detail = length < 300
    ? 'ATS 文本偏短，建议补充经历细节'
    : length > 2600
      ? 'ATS 文本偏长，建议压缩重复描述'
      : 'ATS 文本长度适合筛选系统读取'

  return makeCheck('ats', 'ATS 文本', points, 15, detail)
}

function scoreCompleteness(data, activeModules) {
  const check = getResumeChecklist(data, activeModules)
  const penalty = check.issues.length * 5 + check.warnings.length * 2
  const points = clampScore(15 - penalty, 15)
  const detail = check.issues[0] || check.warnings[0] || '导出前检查通过'
  return makeCheck('quality', '导出检查', points, 15, detail)
}

function gradeFor(score) {
  if (score >= 85) return { grade: 'A', level: 'strong', summary: '内容已经比较完整，可以针对目标岗位做最后打磨。' }
  if (score >= 70) return { grade: 'B', level: 'good', summary: '整体可用，优先补强扣分最高的模块。' }
  if (score >= 50) return { grade: 'C', level: 'fair', summary: '基础框架已建立，但还需要补充经历、技能和岗位匹配。' }
  return { grade: 'D', level: 'weak', summary: '信息仍偏少，建议先补全基础信息和至少一段经历。' }
}

export function getResumeHealth({ data, activeModules, moduleOrder, jdText = '' }) {
  const checks = [
    scoreBasic(data),
    scoreEducation(data, activeModules),
    scoreExperience(data, activeModules),
    scoreSkills(data, activeModules, jdText),
    scoreAtsText(data, activeModules, moduleOrder),
    scoreCompleteness(data, activeModules)
  ]
  const score = clampScore(checks.reduce((sum, item) => sum + item.points, 0), 100)
  const meta = gradeFor(score)
  const quickWins = checks
    .filter((item) => item.status !== 'good')
    .sort((a, b) => (b.max - b.points) - (a.max - a.points))
    .slice(0, 3)
    .map((item) => item.detail)

  return {
    score,
    checks,
    quickWins,
    progressStatus: score >= 85 ? 'success' : score >= 60 ? 'warning' : 'exception',
    ...meta
  }
}
