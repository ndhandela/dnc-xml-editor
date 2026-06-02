// POST /api/checkout
// Creates a Stripe Checkout Session for DNC XML Editor ($29 one-time)

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Derive base URL from the incoming request — works on any Vercel deployment URL
  const proto   = req.headers['x-forwarded-proto'] || 'https'
  const host    = req.headers['x-forwarded-host']  || req.headers.host
  const baseUrl = `${proto}://${host}`

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'DNC XML Editor',
              description:
                'Professional XML editor for Windows — lifetime license. ' +
                'Includes real-time validation, XPath evaluator, syntax highlighting, tree/grid view, format/minify, and find & replace.',
            },
            unit_amount: 2900, // $29.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/api/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/cancel.html`,
      billing_address_collection: 'auto',
      customer_creation: 'always',
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('[checkout] Stripe error:', err.message)
    return res.status(500).json({ error: 'Failed to create checkout session. Please try again.' })
  }
}
