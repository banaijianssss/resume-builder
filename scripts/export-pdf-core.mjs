import puppeteer from 'puppeteer'

const STORAGE_KEY = 'resume-builder-data'
const PAPER_PADDING_MM = 8

const PRINT_CSS = `
  .app-header, .template-panel, .editor-panel,
  .preview-panel > h3, .font-size-control, .export-actions {
    display: none !important;
  }
  body { background: #fff !important; }
  .app-main { display: block !important; padding: 0 !important; gap: 0 !important; }
  .template-panel, .editor-panel { display: none !important; }
  .preview-panel {
    max-height: none !important; box-shadow: none !important;
    border-radius: 0 !important; padding: 0 !important;
  }
  .preview-container {
    overflow: visible !important; padding: 0 !important; background: #fff !important;
  }
  .resume-paper {
    box-shadow: none !important; max-width: none !important; width: 100% !important;
  }
  .page-break { display: none !important; }
`

const LAUNCH_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--font-render-hinting=none'
]

let browserInstance = null

function isChromeMissingError(err) {
  const msg = err?.message || ''
  return /Could not find Chrome/i.test(msg) || /Could not find browser/i.test(msg)
}

async function launchBrowser() {
  const base = { headless: true, args: LAUNCH_ARGS }

  // 1. Puppeteer 缓存目录中的 Chrome
  try {
    const executablePath = puppeteer.executablePath()
    return await puppeteer.launch({ ...base, executablePath })
  } catch (err) {
    if (!isChromeMissingError(err)) throw err
  }

  // 2. 本机已安装的 Chrome / Edge
  for (const channel of ['chrome', 'msedge']) {
    try {
      return await puppeteer.launch({ ...base, channel })
    } catch {
      /* 尝试下一个 */
    }
  }

  throw new Error(
    '未找到可用于导出的 Chrome。请在项目根目录执行：npm run setup:chrome\n' +
    '或安装 Google Chrome 后重试。'
  )
}

async function getBrowser() {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await launchBrowser()
  }
  return browserInstance
}

export async function closePdfBrowser() {
  if (browserInstance) {
    await browserInstance.close()
    browserInstance = null
  }
}

/**
 * @param {object} options
 * @param {string} options.origin - e.g. http://127.0.0.1:3000
 * @param {object} options.state - resume state for localStorage
 * @returns {Promise<Buffer>}
 */
function wrapExportError(err, origin) {
  const msg = err?.message || String(err)
  if (/ERR_CONNECTION_REFUSED/i.test(msg)) {
    return new Error(
      `无法连接 ${origin}。请先运行 start.bat 或 npm run dev，并在浏览器中打开该地址后再导出。`
    )
  }
  return err
}

export async function generateResumePdf({ origin, state }) {
  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 })

    await page.evaluateOnNewDocument(
      (key, payload) => {
        localStorage.setItem(key, JSON.stringify(payload))
      },
      STORAGE_KEY,
      state
    )

    await page.goto(origin, { waitUntil: 'load', timeout: 60000 })
    await page.waitForSelector('.resume-paper', { timeout: 15000 })
    await page.evaluate(() => new Promise((r) => setTimeout(r, 500)))

    await page.addStyleTag({ content: PRINT_CSS })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: `${PAPER_PADDING_MM}mm`,
        right: `${PAPER_PADDING_MM}mm`,
        bottom: `${PAPER_PADDING_MM}mm`,
        left: `${PAPER_PADDING_MM}mm`
      }
    })

    return Buffer.from(pdf)
  } catch (err) {
    throw wrapExportError(err, origin)
  } finally {
    await page.close()
  }
}
