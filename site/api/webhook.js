// POST /api/webhook
// Stripe webhook — listens for checkout.session.completed
// Logs purchase to PostgreSQL table: dnc_xml_purchases

import Stripe from 'stripe'
import { Pool } from 'pg'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// Vercel: disable body parser so we can verify Stripe's raw-body signature
export const config = {
  api: { bodyParser: false },
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end',  () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig     = req.headers['stripe-signature']
  const rawBody = await getRawBody(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook error: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const email          = session.customer_details?.email ?? null
    const stripeSessionId = session.id
    const amount          = session.amount_total // cents

    try {
      await pool.query(
        `INSERT INTO dnc_xml_purchases (email, stripe_session_id, amount, purchased_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (stripe_session_id) DO NOTHING`,
        [email, stripeSessionId, amount]
      )
      console.log(`[webhook] Purchase logged — ${email} | session ${stripeSessionId} | $${(amount / 100).toFixed(2)}`)
    } catch (dbErr) {
      // Return 200 so Stripe doesn't retry; log for manual recovery
      console.error('[webhook] DB insert error:', dbErr.message)
    }
  }

  return res.status(200).json({ received: true })
}
