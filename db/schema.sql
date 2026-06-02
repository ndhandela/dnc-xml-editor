-- DNC XML Editor — Purchase Tracking
-- Run against the TechDen Solutions PostgreSQL (Neon) database.
-- This table is standalone and unrelated to any other TechDen product.

CREATE TABLE IF NOT EXISTS dnc_xml_purchases (
  id                SERIAL PRIMARY KEY,
  email             TEXT,
  stripe_session_id TEXT UNIQUE NOT NULL,
  amount            INTEGER,              -- in cents  (2900 = $29.00)
  purchased_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_dnc_purchases_email        ON dnc_xml_purchases (email);
CREATE INDEX IF NOT EXISTS idx_dnc_purchases_purchased_at ON dnc_xml_purchases (purchased_at DESC);

-- Convenience view for admin dashboard
CREATE OR REPLACE VIEW dnc_xml_sales_summary AS
SELECT
  COUNT(*)                                       AS total_sales,
  COALESCE(SUM(amount), 0)                       AS total_revenue_cents,
  ROUND(COALESCE(SUM(amount), 0) / 100.0, 2)    AS total_revenue_usd,
  MIN(purchased_at)                              AS first_sale_at,
  MAX(purchased_at)                              AS last_sale_at
FROM dnc_xml_purchases;
