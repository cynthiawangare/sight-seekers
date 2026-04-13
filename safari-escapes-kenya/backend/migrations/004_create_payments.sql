CREATE TABLE IF NOT EXISTS payments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider     VARCHAR(20) NOT NULL CHECK (provider IN ('stripe','paypal','mpesa')),
  provider_ref TEXT NOT NULL,
  amount       INTEGER NOT NULL,
  currency     VARCHAR(10) NOT NULL DEFAULT 'USD',
  status       VARCHAR(20) NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','paid','failed','refunded')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_ref ON payments(provider_ref);
