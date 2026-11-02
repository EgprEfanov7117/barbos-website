CREATE TABLE IF NOT EXISTS lead_receipts (
  id TEXT PRIMARY KEY,
  payload_hash TEXT NOT NULL,
  telegram INTEGER NOT NULL DEFAULT 0,
  email INTEGER NOT NULL DEFAULT 0,
  lease_until INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS lead_receipts_expiry ON lead_receipts(expires_at);
CREATE TABLE IF NOT EXISTS lead_limits (
  key TEXT PRIMARY KEY,
  hits INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS lead_limits_expiry ON lead_limits(expires_at);
