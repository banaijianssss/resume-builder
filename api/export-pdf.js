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

  const html = String(body.html || '')
  if (!html) {
    response.status(400).json({ error: 'Missing html' })
    return
  }

  try {
    const chromium = await import('@sparticuz/chromium')
    const puppeteer = await import('puppeteer-core')

    const browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: { width: 794, height: 1123 },
      executablePath: await chromium.default.executablePath(),
      headless: true
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' }
    })
    await browser.close()

    response.setHeader('Content-Type', 'application/pdf')
    response.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"')
    response.status(200).send(Buffer.from(pdf))
  } catch (error) {
    response.status(500).json({
      error: error?.message || 'PDF export failed. Install @sparticuz/chromium + puppeteer-core on Vercel.'
    })
  }
}