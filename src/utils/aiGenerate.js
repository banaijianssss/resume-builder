export async function generateProfessionalSummary(resumeData) {
  const res = await fetch('/api/generate-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeData })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '生成失败')
  return data.text
}

export async function generateInterviewQuestions({ resumeData, jdText = '' }) {
  const res = await fetch('/api/generate-interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeData, jdText })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '生成失败')
  return data.questions || []
}