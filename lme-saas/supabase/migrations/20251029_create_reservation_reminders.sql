-- ========================================
-- Reservation Reminders Table
-- ========================================

-- Create reservation_reminders table
CREATE TABLE IF NOT EXISTS reservation_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('confirmation', 'reminder', 'follow_up')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  channel TEXT NOT NULL DEFAULT 'line' CHECK (channel IN ('line', 'email', 'sms')),
  message_template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  message_content TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reservation_reminders_organization_id
ON reservation_reminders(organization_id);

CREATE INDEX IF NOT EXISTS idx_reservation_reminders_reservation_id
ON reservation_reminders(reservation_id);

CREATE INDEX IF NOT EXISTS idx_reservation_reminders_scheduled_at
ON reservation_reminders(scheduled_at)
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_reservation_reminders_status
ON reservation_reminders(status, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_reservation_reminders_type
ON reservation_reminders(organization_id, reminder_type);

-- Enable RLS
ALTER TABLE reservation_reminders ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER update_reservation_reminders_updated_at
  BEFORE UPDATE ON reservation_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE reservation_reminders IS 'Scheduled reminders for reservations';
COMMENT ON COLUMN reservation_reminders.reminder_type IS 'Type of reminder: confirmation, reminder before appointment, or follow-up after';
COMMENT ON COLUMN reservation_reminders.scheduled_at IS 'When the reminder should be sent';
COMMENT ON COLUMN reservation_reminders.channel IS 'Communication channel for reminder';
COMMENT ON COLUMN reservation_reminders.message_template_id IS 'Template used for message (optional)';
COMMENT ON COLUMN reservation_reminders.message_content IS 'Actual message content sent';
