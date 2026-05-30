/**
 * 从 JD 文本中匹配简历技能词
 * @param {string} jdText
 * @param {string[]} skills
 */
export function matchSkillsToJd(jdText, skills) {
  const jd = (jdText || '').toLowerCase()
  if (!jd.trim() || !skills?.length) {
    return { matched: [], missing: [...(skills || [])] }
  }

  const matched = []
  const missing = []

  for (const skill of skills) {
    const s = skill.trim()
    if (!s) continue
    const key = s.toLowerCase()
    if (jd.includes(key)) matched.push(s)
    else missing.push(s)
  }

  return { matched, missing }
}
