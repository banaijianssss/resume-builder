import activatePro from './_handlers/activate-pro.js'
import createCheckoutSession from './_handlers/create-checkout-session.js'
import createCheckoutSubscription from './_handlers/create-checkout-subscription.js'
import verifyProToken from './_handlers/verify-pro-token.js'
import exportPdf from './_handlers/export-pdf.js'
import generateSummary from './_handlers/generate-summary.js'
import generateInterview from './_handlers/generate-interview.js'
import polishText from './_handlers/polish-text.js'
import shareLoad from './_handlers/share-load.js'
import shareRegister from './_handlers/share-register.js'
import shareView from './_handlers/share-view.js'
import syncLoad from './_handlers/sync-load.js'
import syncSave from './_handlers/sync-save.js'

const routes = {
  'activate-pro': activatePro,
  'create-checkout-session': createCheckoutSession,
  'create-checkout-subscription': createCheckoutSubscription,
  'verify-pro-token': verifyProToken,
  'export-pdf': exportPdf,
  'generate-summary': generateSummary,
  'generate-interview': generateInterview,
  'polish-text': polishText,
  'share/load': shareLoad,
  'share/register': shareRegister,
  'share/view': shareView,
  'sync/load': syncLoad,
  'sync/save': syncSave
}

function getApiPath(request) {
  const url = new URL(request.url || '/', `http://${request.headers?.host || 'localhost'}`)
  const queryPath = url.searchParams.get('__path')
  if (queryPath) return queryPath.replace(/^\/+/, '').replace(/\/+$/, '')

  const pathname = url.pathname.replace(/^\/api\/?/, '').replace(/\/+$/, '')
  if (pathname === 'index') return ''
  return pathname
}

export default async function handler(request, response) {
  const path = getApiPath(request)
  const route = routes[path]

  if (!route) {
    response.status(404).json({ error: 'Not Found', path })
    return
  }

  return route(request, response)
}