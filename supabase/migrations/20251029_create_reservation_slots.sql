-- ========================================
-- Reservation Slots Table
-- ========================================

-- Create reservation_slots table
CREATE TABLE IF NOT EXISTS reservation_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  reservation_type_id UUID NOT NULL REFERENCES reservation_types(id) ON DELETE CASCADE,
  slot_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  booked_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'full', 'blocked', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reservation_slots_capacity_positive CHECK (capacity > 0),
  CONSTRAINT reservation_slots_booked_count_valid CHECK (booked_count >= 0 AND booked_count <= capacity),
  CONSTRAINT reservation_slots_datetime_order CHECK (end_datetime > slot_datetime),
  CONSTRAINT reservation_slots_unique_slot UNIQUE (reservation_type_id, slot_datetime)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reservation_slots_organization_id
ON reservation_slots(organization_id);

CREATE INDEX IF NOT EXISTS idx_reservation_slots_type_id
ON reservation_slots(reservation_type_id);

CREATE INDEX IF NOT EXISTS idx_reservation_slots_datetime
ON reservation_slots(slot_datetime);

CREATE INDEX IF NOT EXISTS idx_reservation_slots_status
ON reservation_slots(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_reservation_slots_availability
ON reservation_slots(reservation_type_id, slot_datetime, status)
WHERE status = 'available';

CREATE INDEX IF NOT EXISTS idx_reservation_slots_date_range
ON reservation_slots(organization_id, slot_datetime, end_datetime);

-- Enable RLS
ALTER TABLE reservation_slots ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER update_reservation_slots_updated_at
  BEFORE UPDATE ON reservation_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE reservation_slots IS 'Individual time slots available for reservations';
COMMENT ON COLUMN reservation_slots.capacity IS 'How many reservations can be made for this slot';
COMMENT ON COLUMN reservation_slots.booked_count IS 'Current number of bookings for this slot';
COMMENT ON COLUMN reservation_slots.metadata IS 'Additional slot metadata (location, staff, etc.)';
