CREATE SCHEMA IF NOT EXISTS networking;
SET search_path TO networking;
CREATE TABLE IF NOT EXISTS connections(
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, url TEXT DEFAULT '', email TEXT DEFAULT '', company TEXT DEFAULT '',
  position TEXT DEFAULT '', connected_on DATE, yoe NUMERIC, yoe_source TEXT, band TEXT, domain TEXT,
  is_ai BOOLEAN DEFAULT false, is_product BOOLEAN DEFAULT false, starred BOOLEAN DEFAULT false);
CREATE INDEX IF NOT EXISTS idx_c_company ON connections(company);
CREATE INDEX IF NOT EXISTS idx_c_band ON connections(band);
CREATE INDEX IF NOT EXISTS idx_c_domain ON connections(domain);