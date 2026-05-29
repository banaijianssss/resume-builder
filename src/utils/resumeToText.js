import { availableModules } from '../data/templates.js'

const moduleLabels = Object.fromEntries(
  availableModules.map((m) => [m.id, m.label])
)

function orderedActiveIds(activeModules, moduleOrder) {
  const active = new Set(activeModules)
  const ordered = moduleOrder.filter((id) => active.has(id))
  const rest = activeModules.filter((id) => !ordered.includes(id))
  return [...ordered, ...rest]
}

function section(lines, title) {
  lines.push('')
  lines.push(`【${title}】`)
}

/**
 * 将简历数据转为纯文本（ATS 友好）
 */
export function buildResumeText(data, activeModules, moduleOrder) {
  const lines = []
  const order = orderedActiveIds(activeModules, moduleOrder)

  for (const modId of order) {
    switch (modId) {
      case 'basic': {
        const name = data.name?.trim() || '姓名'
        lines.push(name)
        const contact = [data.email, data.phone].filter(Boolean).join(' | ')
        if (contact) lines.push(contact)
        if (data.objective?.trim()) lines.push(`求职意向：${data.objective.trim()}`)
        break
      }
      case 'education': {
        section(lines, moduleLabels.education)
        const parts = [
          data.school,
          data.major,
          data.degree,
          data.graduationYear ? `${data.graduationYear}年毕业` : ''
        ].filter(Boolean)
        if (parts.length) lines.push(parts.join(' | '))
        break
      }
      case 'internship':
        if (data.internship?.length) {
          section(lines, moduleLabels.internship)
          data.internship.forEach((item, i) => {
            if (i > 0) lines.push('')
            const head = [item.company, item.period].filter(Boolean).join(' | ')
            if (head) lines.push(head)
            if (item.role?.trim()) lines.push(item.role.trim())
            if (item.description?.trim()) lines.push(item.description.trim())
          })
        }
        break
      case 'project':
        if (data.project?.length) {
          section(lines, moduleLabels.project)
          data.project.forEach((item, i) => {
            if (i > 0) lines.push('')
            const head = [item.name, item.period].filter(Boolean).join(' | ')
            if (head) lines.push(head)
            if (item.role?.trim()) lines.push(item.role.trim())
            if (item.description?.trim()) lines.push(item.description.trim())
          })
        }
        break
      case 'campus':
        if (data.campus?.length) {
          section(lines, moduleLabels.campus)
          data.campus.forEach((item, i) => {
            if (i > 0) lines.push('')
            const head = [item.organization, item.period].filter(Boolean).join(' | ')
            if (head) lines.push(head)
            if (item.role?.trim()) lines.push(item.role.trim())
            if (item.description?.trim()) lines.push(item.description.trim())
          })
        }
        break
      case 'skills':
        if (data.skills?.length) {
          section(lines, moduleLabels.skills)
          lines.push(data.skills.join('、'))
        }
        break
      case 'awards': {
        const awards = (data.awards || '')
          .split('\n')
          .map((a) => a.trim())
          .filter(Boolean)
        if (awards.length) {
          section(lines, moduleLabels.awards)
          awards.forEach((a) => lines.push(`• ${a}`))
        }
        break
      }
      case 'hobbies':
        if (data.hobbies?.length) {
          section(lines, moduleLabels.hobbies)
          lines.push(data.hobbies.join('、'))
        }
        break
      case 'self_eval':
        if (data.selfEval?.trim()) {
          section(lines, moduleLabels.self_eval)
          lines.push(data.selfEval.trim())
        }
        break
      default:
        break
    }
  }

  return lines.join('\n').trim() + '\n'
}

export function downloadTextFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
