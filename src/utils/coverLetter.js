export function getEmptyCoverLetter() {
  return {
    recipient: '',
    company: '',
    position: '',
    date: new Date().toISOString().slice(0, 10),
    greeting: '尊敬的招聘负责人：',
    body: '',
    closing: '此致\n敬礼',
    signature: ''
  }
}

export function buildCoverLetterText(letter, resumeName = '') {
  const l = { ...getEmptyCoverLetter(), ...letter }
  const lines = [
    l.date,
    '',
    l.company ? `致：${l.company}` : '',
    l.recipient ? l.recipient : '',
    l.position ? `应聘岗位：${l.position}` : '',
    '',
    l.greeting,
    '',
    l.body.trim(),
    '',
    l.closing,
    '',
    l.signature || resumeName || ''
  ]
  return lines.filter((line, idx, arr) => !(line === '' && arr[idx - 1] === '')).join('\n')
}