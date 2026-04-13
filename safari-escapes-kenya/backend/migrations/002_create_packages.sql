CREATE TABLE IF NOT EXISTS packages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  price_cents   INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  location      VARCHAR(200),
  image_url     TEXT,
  highlights    TEXT[],
  included      TEXT[],
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
