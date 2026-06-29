import { getStripeClient } from './_lib/stripeClient.js'
import { issueProToken } from './_lib/proToken.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  let body = request.body || {}
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}')
    } catch {
      response.status(400).json({ error: 'Invalid JSON body' })
      return
    }
  }
  const sessionId = body.sessionId
  if (!sessionId || typeof sessionId !== 'string') {
    response.status(400).json({ error: 'Invalid sessionId' })
    return
  }

  try {
    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    let active = session?.payment_status === 'paid'

    if (session?.mode === 'subscription' && session.subscription) {
      const subId = typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id
      const sub = await stripe.subscriptions.retrieve(subId)
      active = ['active', 'trialing'].includes(sub.status)
    }

    if (!session || !active) {
      response.status(402).json({ error: 'Session is not paid or active' })
      return
    }

    const token = issueProToken({
      sessionId: session.id,
      email: session.customer_details?.email || ''
    })

    response.status(200).json({
      proToken: token,
      email: session.customer_details?.email || '',
      paidAt: session.created
    })
  } catch (error) {
    response.status(500).json({ error: error?.message || 'Activate pro failed' })
  }
}