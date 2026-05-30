const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[\d\s+\-()]{7,20}$/

export function validateField(field, value) {
  const v = typeof value === 'string' ? value.trim() : value
  if (field === 'email' && v && !EMAIL_RE.test(v)) return '邮箱格式不正确'
  if (field === 'phone' && v && !PHONE_RE.test(v)) return '电话格式不正确'
  if (field === 'name' && !v) return '建议填写姓名'
  return ''
}

/**
 * @param {object} data
 * @param {string[]} activeModules
 */
export function getResumeChecklist(data, activeModules) {
  const issues = []
  const warnings = []

  if (!data.name?.trim()) issues.push('未填写姓名')
  else if (data.name.trim().length < 2) warnings.push('姓名过短')

  if (activeModules.includes('basic')) {
    if (!data.email?.trim() && !data.phone?.trim()) {
      warnings.push('未填写邮箱或电话')
    }
    if (data.email?.trim() && !EMAIL_RE.test(data.email.trim())) {
      issues.push('邮箱格式不正确')
    }
    if (data.phone?.trim() && !PHONE_RE.test(data.phone.trim())) {
      warnings.push('电话格式可能不正确')
    }
  }

  if (activeModules.includes('education')) {
    const list = Array.isArray(data.education) ? data.education : []
    if (!list.length) warnings.push('未添加教育经历')
    else if (!list.some((e) => e.school?.trim())) warnings.push('教育经历缺少学校名称')
  }

  const expModules = [
    ['internship', '实习经历'],
    ['project', '项目经历'],
    ['campus', '校园经历']
  ]
  for (const [key, label] of expModules) {
    if (activeModules.includes(key) && (!data[key]?.length)) {
      warnings.push(`已开启「${label}」但尚无内容`)
    }
  }

  if (activeModules.includes('skills') && !data.skills?.length) {
    warnings.push('技能列表为空')
  }

  if (data.avatar && data.avatar.length > 400_000) {
    warnings.push('头像较大，可能影响保存与导出速度，建议压缩')
  }

  return {
    issues,
    warnings,
    ok: issues.length === 0
  }
}

export function formatChecklistMessage({ issues, warnings }) {
  const lines = []
  if (issues.length) {
    lines.push('【需处理】')
    issues.forEach((i) => lines.push(`· ${i}`))
  }
  if (warnings.length) {
    lines.push('【建议】')
    warnings.forEach((w) => lines.push(`· ${w}`))
  }
  return lines.join('\n')
}
