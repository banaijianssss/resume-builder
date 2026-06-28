function ruleBasedPolish(text) {
  let out = String(text || '').trim()
  if (!out) return out

  const replacements = [
    [/^负责/, '主导'],
    [/^参与/, '深度参与'],
    [/做了/, '完成'],
    [/帮忙/, '协助团队'],
    [/很多/, '多项'],
    [/比较好/, '显著'],
    [/(\d+)%/g, '$1%'],
  ]
  for (const [from, to] of replacements) {
    out = out.replace(from, to)
  }

  if (!/(\d+|%|人|次|个|项|万|倍)/.test(out)) {
    out += '，并通过量化指标验证结果'
  }
  if (!out.endsWith('。') && !out.endsWith('.')) out += '。'
  return out
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

  const text = String(body.text || '')
  const role = String(body.role || '')
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
          temperature: 0.4,
          messages: [
            {
              role: 'system',
              content: '你是中文简历润色助手。将经历描述改写为简洁、量化、动词开头的 bullet，保留事实，不编造。只输出改写后的文本。'
            },
            {
              role: 'user',
              content: `岗位：${role || '未指定'}\n原文：${text}`
            }
          ]
        })
      })
      const data = await res.json()
      const polished = data?.choices?.[0]?.message?.content?.trim()
      if (polished) {
        response.status(200).json({ polished, mode: 'ai' })
        return
      }
    } catch {
      // fallback below
    }
  }

  response.status(200).json({ polished: ruleBasedPolish(text), mode: 'rules' })
}