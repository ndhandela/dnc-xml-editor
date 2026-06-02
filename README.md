# DNC XML Editor — TechDen Solutions

Product site: https://techdensolutions.com/products/dnc-xml-editor

---

## Folder Structure

```
DNC-XML-Editor/
├── app/          → Electron desktop app + Windows EXE builder
├── site/         → Product website + Stripe checkout API
│   └── api/      → Vercel serverless functions
├── db/           → PostgreSQL schema
└── README.md
```

---

## To Rebuild the EXE

```bash
cd app
npm install
npm run dist
# Output: app/dist/DNC XML Editor Setup 1.0.0.exe
```

Upload the resulting `.exe` to cloud storage (Google Drive, S3, or Cloudflare R2)
and update `EXE_DOWNLOAD_URL` in Vercel environment variables.

---

## To Run the Site Locally

```bash
cd site
vercel dev
```

Open http://localhost:3000

---

## Environment Variables

Copy `site/.env.local.example` to `site/.env.local` and fill in real values.

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `EXE_DOWNLOAD_URL` | Direct / pre-signed URL to the `.exe` in cloud storage |
| `DATABASE_URL` | Neon PostgreSQL connection string |

All four must also be set in **Vercel → Project Settings → Environment Variables**.

---

## Deploy Checklist

- [ ] Build EXE and upload to storage; set `EXE_DOWNLOAD_URL`
- [ ] Run `db/schema.sql` against the TechDen Neon DB
- [ ] Deploy `site/` to Vercel under path `/products/dnc-xml-editor`
- [ ] Set all env vars in Vercel
- [ ] Register Stripe webhook: `https://techdensolutions.com/api/webhook`
- [ ] Smoke-test: buy flow end-to-end in Stripe test mode
- [ ] Switch Stripe keys to live mode

---

## Support

support@techdensolutions.com
