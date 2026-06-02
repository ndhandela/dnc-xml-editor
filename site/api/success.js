// GET /api/success?session_id=xxx
// Verifies Stripe payment and generates a 15-min presigned R2 download URL.

import Stripe from 'stripe'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT, // https://12784e2e85adf1446df6934059d65487.r2.cloudflarestorage.com
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

const PRODUCT_URL = process.env.BASE_URL || 'https://techdensolutions.com/products/dnc-xml-editor'

export default async function handler(req, res) {
  const { session_id } = req.query

  if (!session_id) {
    return res.redirect(302, PRODUCT_URL)
  }

  let session
  try {
    session = await stripe.checkout.sessions.retrieve(session_id)
  } catch (err) {
    console.error('[success] Stripe retrieve error:', err.message)
    return res.redirect(302, PRODUCT_URL)
  }

  if (session.payment_status !== 'paid') {
    return res.redirect(302, PRODUCT_URL)
  }

  // Generate 15-minute presigned R2 download URL
  let downloadUrl
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET,           // techdensolutions-downloads
      Key:    process.env.R2_FILE_KEY, // 'DNC-XML-Editor-1.0.0.dmg' (mac) or 'DNC-XML-Editor-Setup-1.0.0.exe' (win)
    })
    downloadUrl = await getSignedUrl(r2, command, { expiresIn: 900 }) // 900s = 15 min
  } catch (err) {
    console.error('[success] R2 presign error:', err.message)
    return res.status(500).send('Failed to generate download link. Contact support@techdensolutions.com.')
  }

  const email    = session.customer_details?.email || ''
  const base     = process.env.BASE_URL || ''
  const redirect = `${base}/success` +
    `?download=${encodeURIComponent(downloadUrl)}` +
    `&email=${encodeURIComponent(email)}`

  return res.redirect(302, redirect)
}
