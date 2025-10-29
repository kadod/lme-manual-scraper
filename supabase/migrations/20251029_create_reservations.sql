-- ========================================
-- Reservations Table
-- ========================================

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  reservation_type_id UUID NOT NULL REFERENCES reservation_types(id) ON DELETE RESTRICT,
  slot_id UUID NOT NULL REFERENCES reservation_slots(id) ON DELETE RESTRICT,
  line_friend_id UUID REFERENCES line_friends(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  customer_line_user_id TEXT,
  notes TEXT,
  reservation_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reservations_organization_id
ON reservations(organization_id);

CREATE INDEX IF NOT EXISTS idx_reservations_type_id
ON reservations(reservation_type_id);

CREATE INDEX IF NOT EXISTS idx_reservations_slot_id
ON reservations(slot_id);

CREATE INDEX IF NOT EXISTS idx_reservations_line_friend_id
ON reservations(line_friend_id);

CREATE INDEX IF NOT EXISTS idx_reservations_status
ON reservations(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_reservations_customer_phone
ON reservations(customer_phone)
WHERE customer_phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reservations_customer_email
ON reservations(customer_email)
WHERE customer_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reservations_customer_line_user_id
ON reservations(customer_line_user_id)
WHERE customer_line_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reservations_created_at
ON reservations(created_at DESC);

-- Enable RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update slot booked_count
CREATE OR REPLACE FUNCTION update_slot_booked_count()
RETURNS TRIGGER AS $$
BEGIN
  -- On insert or status change to confirmed
  IF (TG_OP = 'INSERT' AND NEW.status IN ('pending', 'confirmed')) OR
     (TG_OP = 'UPDATE' AND OLD.status NOT IN ('pending', 'confirmed') AND NEW.status IN ('pending', 'confirmed')) THEN
    UPDATE reservation_slots
    SET
      booked_count = booked_count + 1,
      status = CASE
        WHEN booked_count + 1 >= capacity THEN 'full'
        ELSE 'available'
      END
    WHERE id = NEW.slot_id;
  END IF;

  -- On delete or status change from confirmed
  IF (TG_OP = 'DELETE' AND OLD.status IN ('pending', 'confirmed')) OR
     (TG_OP = 'UPDATE' AND OLD.status IN ('pending', 'confirmed') AND NEW.status NOT IN ('pending', 'confirmed')) THEN
    UPDATE reservation_slots
    SET
      booked_count = GREATEST(0, booked_count - 1),
      status = CASE
        WHEN booked_count - 1 < capacity AND status = 'full' THEN 'available'
        ELSE status
      END
    WHERE id = COALESCE(NEW.slot_id, OLD.slot_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_slot_booked_count
  AFTER INSERT OR UPDATE OR DELETE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_slot_booked_count();

-- Add comments
COMMENT ON TABLE reservations IS 'Customer reservations for specific time slots';
COMMENT ON COLUMN reservations.line_friend_id IS 'Link to LINE friend if available';
COMMENT ON COLUMN reservations.customer_line_user_id IS 'LINE user ID for matching';
COMMENT ON COLUMN reservations.reservation_data IS 'Custom form data collected during reservation';
COMMENT ON COLUMN reservations.metadata IS 'Additional metadata (source, referrer, etc.)';
