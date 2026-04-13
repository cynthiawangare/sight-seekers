CREATE TABLE IF NOT EXISTS bookings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id   UUID NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
  start_date   DATE NOT NULL,
  guests       INTEGER NOT NULL DEFAULT 1,
  total_cents  INTEGER NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','confirmed','cancelled','completed')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_package ON bookings(package_id);
