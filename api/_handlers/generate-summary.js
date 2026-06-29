function ruleBasedSummary(resumeData = {}) {
  const name = resumeData.name || '候选人'
  const objective = resumeData.objective?.trim()
  if (objective) return objective

  const skills = (resumeData.skills || []).slice(0, 5).join('、')
  const latestExp = resumeData.internship?.[0] || resumeData.project?.[0]
  const role = latestExp?.role || latestExp?.name || '相关岗位'
  const company = latestExp?.company || latestExp?.organization || ''

  let text = `${name}，具备${skills || '扎实的专业技能'}，曾在${company || '多个项目'}担任${role}，擅长将业务目标拆解为可执行方案并推动落地。`
  if (resumeData.education?.[0]?.school) {
    text += ` 教育背景：${resumeData.education[0].school}${resumeData.education[0].major ? ` · ${resumeData.education[0].major}` : ''}。`
  }
  return text
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
          temperature: 0.5,
          messages: [
            {
              role: 'system',
              content: '你是中文简历顾问。根据简历 JSON 生成 2-3 句专业求职摘要，突出优势与量化成果，不编造未提供的信息。只输出摘要正文。'
            },
            { role: 'user', content: JSON.stringify(resumeData).slice(0, 6000) }
          ]
        })
      })
      const data = await res.json()
      const text = data?.choices?.[0]?.message?.content?.trim()
      if (text) {
        response.status(200).json({ text, source: 'openai' })
        return
      }
    } catch {
      // fallback below
    }
  }

  response.status(200).json({ text: ruleBasedSummary(resumeData), source: 'rules' })
}