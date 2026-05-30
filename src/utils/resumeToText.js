import { availableModules } from '../data/templates.js'

const moduleLabels = Object.fromEntries(availableModules.map((m) => [m.id, m.label]))

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

export function buildResumeText(data, activeModules, moduleOrder) {
  const lines = []
  const order = orderedActiveIds(activeModules, moduleOrder)

  for (const modId of order) {
    switch (modId) {
      case 'basic': {
        lines.push(data.name?.trim() || '姓名')
        const contact = [data.email, data.phone].filter(Boolean).join(' | ')
        if (contact) lines.push(contact)
        const links = [data.github, data.portfolio, data.linkedin].filter((x) => x?.trim())
        if (links.length) lines.push(links.join(' | '))
        if (data.objective?.trim()) lines.push(`求职意向：${data.objective.trim()}`)
        break
      }
      case 'education': {
        const list = Array.isArray(data.education) ? data.education : []
        if (list.length) {
          section(lines, moduleLabels.education)
          list.forEach((edu, i) => {
            if (i > 0) lines.push('')
            const parts = [
              edu.school,
              edu.major,
              edu.degree,
              edu.graduationYear ? `${edu.graduationYear}年毕业` : ''
            ].filter(Boolean)
            if (parts.length) lines.push(parts.join(' | '))
          })
        }
        break
      }
      case 'internship':
      case 'project':
      case 'campus': {
        const items = data[modId]
        if (items?.length) {
          section(lines, moduleLabels[modId])
          const primary = modId === 'internship' ? 'company' : modId === 'project' ? 'name' : 'organization'
          items.forEach((item, i) => {
            if (i > 0) lines.push('')
            const head = [item[primary], item.period].filter(Boolean).join(' | ')
            if (head) lines.push(head)
            if (item.role?.trim()) lines.push(item.role.trim())
            if (item.description?.trim()) lines.push(item.description.trim())
          })
        }
        break
      }
      case 'skills':
        if (data.skills?.length) {
          section(lines, moduleLabels.skills)
          lines.push(data.skills.join('、'))
        }
        break
      case 'awards': {
        const awards = (data.awards || '').split('\n').map((a) => a.trim()).filter(Boolean)
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
      case 'custom':
        if (data.customSections?.length) {
          data.customSections.forEach((sec) => {
            if (!sec.title?.trim() && !sec.content?.trim()) return
            section(lines, sec.title?.trim() || '其他')
            if (sec.content?.trim()) lines.push(sec.content.trim())
          })
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
