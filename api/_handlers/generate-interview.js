function ruleBasedQuestions(resumeData = {}, jdText = '') {
  const role = resumeData.internship?.[0]?.role || resumeData.project?.[0]?.role || '该岗位'
  const skills = (resumeData.skills || []).slice(0, 3)
  const base = [
    `请结合你在${role}的经历，介绍一个你主导解决的技术或业务难题。`,
    '你如何在压力下协调多方资源并按时交付？请举例说明。',
    skills.length
      ? `岗位涉及 ${skills.join('、')}，请分享你最具代表性的实践案例。`
      : '请描述一次你通过数据驱动优化结果的经历。'
  ]
  if (jdText.trim()) {
    base.push('基于目标岗位 JD，你认为自己的最大匹配点与需要补强的点分别是什么？')
  }
  return base.slice(0, 5)
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  let body = request.body || {}
  if (typeof body === 'string') {
    try { body = JSON.parse(body || '{}') } catch {
      response.status(400).json({ error: 'Invalid JSON' })
      return
    }
  }

  const resumeData = body.resumeData || {}
  const jdText = String(body.jdText || '')
  const apiKey = process.env.OPENAI_API_KEY

  if (apiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          temperature: 0.6,
          messages: [
            {
              role: 'system',
              content: '你是面试教练。根据简历与 JD 生成 5 条中文面试题，覆盖经历深挖、技能验证与岗位匹配。以 JSON 数组输出，不要其它文字。'
            },
            {
              role: 'user',
              content: JSON.stringify({ resumeData, jdText }).slice(0, 7000)
            }
          ]
        })
      })
      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content?.trim() || ''
      try {
        const parsed = JSON.parse(content)
        if (Array.isArray(parsed) && parsed.length) {
          response.status(200).json({ questions: parsed.map(String).slice(0, 8), source: 'openai' })
          return
        }
      } catch {
        const lines = content.split('\n').map((l) => l.replace(/^\d+[\).\s]+/, '').trim()).filter(Boolean)
        if (lines.length) {
          response.status(200).json({ questions: lines.slice(0, 8), source: 'openai' })
          return
        }
      }
    } catch {
      // fallback
    }
  }

  response.status(200).json({
    questions: ruleBasedQuestions(resumeData, jdText),
    source: 'rules'
  })
}