function resolveOrigin(server, req) {
  const host = req.headers.host
  if (host) return `http://${host}`

  const local = server.resolvedUrls?.local?.[0]
  if (local) return local.replace(/\/$/, '')

  const addr = server.httpServer?.address()
  if (typeof addr === 'object' && addr?.port) {
    let hostAddr = addr.address
    if (hostAddr === '::' || hostAddr === '0.0.0.0' || hostAddr === '::1') {
      hostAddr = '127.0.0.1'
    }
    return `http://${hostAddr}:${addr.port}`
  }

  const port = server.config?.server?.port ?? 3000
  return `http://127.0.0.1:${port}`
}

export function pdfExportPlugin() {
  return {
    name: 'resume-pdf-export',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]

        if (url === '/api/export-pdf' && req.method === 'HEAD') {
          res.statusCode = 200
          res.end()
          return
        }

        if (url !== '/api/export-pdf' || req.method !== 'POST') {
          return next()
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })
        req.on('end', () => {
          // 让出事件循环，避免 Puppeteer 回连 Vite 时被同一请求占满导致卡死
          setImmediate(async () => {
            try {
              const { generateResumePdf } = await import('./export-pdf-core.mjs')
              const state = JSON.parse(body)
              const origin = resolveOrigin(server, req)

              const pdf = await generateResumePdf({ origin, state })
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/pdf')
              res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"')
              res.end(pdf)
            } catch (err) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err.message || String(err) }))
            }
          })
        })
      })
    },
    async closeBundle() {
      try {
        const { closePdfBrowser } = await import('./export-pdf-core.mjs')
        await closePdfBrowser()
      } catch {
        /* puppeteer 未安装时忽略 */
      }
    }
  }
}
