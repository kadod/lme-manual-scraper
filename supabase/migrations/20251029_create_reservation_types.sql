-- ========================================
-- Reservation Types Table
-- ========================================

-- Create reservation_types table
CREATE TABLE IF NOT EXISTS reservation_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  buffer_minutes INTEGER NOT NULL DEFAULT 0,
  max_slots_per_day INTEGER,
  advance_booking_days INTEGER NOT NULL DEFAULT 30,
  cancellation_deadline_hours INTEGER NOT NULL DEFAULT 24,
  settings JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reservation_types_duration_positive CHECK (duration_minutes > 0),
  CONSTRAINT reservation_types_advance_booking_positive CHECK (advance_booking_days >= 0),
  CONSTRAINT reservation_types_cancellation_positive CHECK (cancellation_deadline_hours >= 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reservation_types_organization_id
ON reservation_types(organization_id);

CREATE INDEX IF NOT EXISTS idx_reservation_types_status
ON reservation_types(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_reservation_types_created_at
ON reservation_types(created_at DESC);

-- Enable RLS
ALTER TABLE reservation_types ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER update_reservation_types_updated_at
  BEFORE UPDATE ON reservation_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE reservation_types IS 'Defines types of reservations available in each organization';
COMMENT ON COLUMN reservation_types.duration_minutes IS 'Duration of each reservation slot in minutes';
COMMENT ON COLUMN reservation_types.buffer_minutes IS 'Buffer time between slots in minutes';
COMMENT ON COLUMN reservation_types.max_slots_per_day IS 'Maximum number of slots per day (NULL = unlimited)';
COMMENT ON COLUMN reservation_types.advance_booking_days IS 'How many days in advance can customers book';
COMMENT ON COLUMN reservation_types.cancellation_deadline_hours IS 'Hours before reservation when cancellation is allowed';
