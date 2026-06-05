import { getStripeClient } from './_lib/stripeClient.js'

function getBaseUrl(request) {
  return (
    process.env.APP_BASE_URL ||
    request.headers.origin ||
    `https://${request.headers.host}`
  )
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const priceId = process.env.STRIPE_PRICE_ID
  if (!priceId) {
    response.status(500).json({ error: 'Missing STRIPE_PRICE_ID' })
    return
  }

  try {
    const stripe = getStripeClient()
    const baseUrl = getBaseUrl(request)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${baseUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?checkout=cancel`
    })
    response.status(200).json({ url: session.url })
  } catch (error) {
    response.status(500).json({ error: error?.message || 'Create checkout failed' })
  }
}
