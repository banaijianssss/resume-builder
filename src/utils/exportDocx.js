import { buildResumeText } from './resumeToText.js'
import { buildCoverLetterText } from './coverLetter.js'

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function paragraph(text) {
  return `<w:p><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`
}

function buildDocumentXml(lines) {
  const body = lines.map((line) => paragraph(line)).join('')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${body}<w:sectPr/></w:body>
</w:document>`
}

async function zipDocx(documentXml) {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  const rels = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  const docRels = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`

  const files = [
    ['[Content_Types].xml', contentTypes],
    ['_rels/.rels', rels],
    ['word/document.xml', documentXml],
    ['word/_rels/document.xml.rels', docRels]
  ]

  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  for (const [path, content] of files) zip.file(path, content)
  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
}

export async function exportResumeDocx({ data, activeModules, moduleOrder, filename }) {
  const text = buildResumeText(data, activeModules, moduleOrder)
  const blob = await zipDocx(buildDocumentXml(text.split('\n')))
  downloadBlob(blob, filename)
}

export async function exportCoverLetterDocx({ coverLetter, resumeName, filename }) {
  const text = buildCoverLetterText(coverLetter, resumeName)
  const blob = await zipDocx(buildDocumentXml(text.split('\n')))
  downloadBlob(blob, filename)
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}