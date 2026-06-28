export async function polishExperienceText({ text, role }) {
  const res = await fetch('/api/polish-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, role })
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || '润色失败')
  return data
}