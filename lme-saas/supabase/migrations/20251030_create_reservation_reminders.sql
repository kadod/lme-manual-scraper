-- Migration: Create reservation reminders system
-- Description: Tables and triggers for automatic reservation reminders

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  reservation_datetime TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reservations_datetime_check CHECK (reservation_datetime > NOW())
);

-- Create reservation_reminders table
CREATE TABLE IF NOT EXISTS reservation_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24_hours', '1_hour', 'custom')),
  remind_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reservation_reminders_unique UNIQUE (reservation_id, reminder_type, remind_at)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reservations_account_id ON reservations(account_id);
CREATE INDEX IF NOT EXISTS idx_reservations_friend_id ON reservations(friend_id);
CREATE INDEX IF NOT EXISTS idx_reservations_datetime ON reservations(reservation_datetime);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

CREATE INDEX IF NOT EXISTS idx_reservation_reminders_reservation_id ON reservation_reminders(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_reminders_remind_at ON reservation_reminders(remind_at) WHERE sent_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reservation_reminders_sent_at ON reservation_reminders(sent_at);

-- Function to automatically create reminder records
CREATE OR REPLACE FUNCTION create_reservation_reminders()
RETURNS TRIGGER AS $$
BEGIN
  -- Create 24-hour reminder
  INSERT INTO reservation_reminders (reservation_id, reminder_type, remind_at)
  VALUES (
    NEW.id,
    '24_hours',
    NEW.reservation_datetime - INTERVAL '24 hours'
  )
  ON CONFLICT (reservation_id, reminder_type, remind_at) DO NOTHING;

  -- Create 1-hour reminder
  INSERT INTO reservation_reminders (reservation_id, reminder_type, remind_at)
  VALUES (
    NEW.id,
    '1_hour',
    NEW.reservation_datetime - INTERVAL '1 hour'
  )
  ON CONFLICT (reservation_id, reminder_type, remind_at) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create reminders on reservation insert
CREATE TRIGGER create_reservation_reminders_trigger
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION create_reservation_reminders();

-- Trigger to update updated_at timestamp
CREATE TRIGGER set_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reservations
CREATE POLICY "Users can view own reservations"
  ON reservations FOR SELECT
  USING (account_id = auth.uid());

CREATE POLICY "Users can insert own reservations"
  ON reservations FOR INSERT
  WITH CHECK (account_id = auth.uid());

CREATE POLICY "Users can update own reservations"
  ON reservations FOR UPDATE
  USING (account_id = auth.uid());

CREATE POLICY "Users can delete own reservations"
  ON reservations FOR DELETE
  USING (account_id = auth.uid());

-- RLS Policies for reservation_reminders (read-only for users)
CREATE POLICY "Users can view own reservation reminders"
  ON reservation_reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reservations
      WHERE reservations.id = reservation_reminders.reservation_id
      AND reservations.account_id = auth.uid()
    )
  );

-- Service role can manage all reminders (for Edge Function)
CREATE POLICY "Service role can manage all reminders"
  ON reservation_reminders FOR ALL
  USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON reservations TO service_role;
GRANT ALL ON reservation_reminders TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON reservations TO authenticated;
GRANT SELECT ON reservation_reminders TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE reservations IS 'User reservations with automatic reminder generation';
COMMENT ON TABLE reservation_reminders IS 'Automatic reminders for reservations (24h, 1h, custom)';
COMMENT ON COLUMN reservation_reminders.reminder_type IS 'Type of reminder: 24_hours, 1_hour, or custom';
COMMENT ON COLUMN reservation_reminders.remind_at IS 'When the reminder should be sent';
COMMENT ON COLUMN reservation_reminders.sent_at IS 'When the reminder was actually sent (NULL = pending)';

-- Setup pg_cron for hourly execution
-- Note: This requires pg_cron extension to be enabled
-- Run this separately after enabling pg_cron extension

-- SELECT cron.schedule(
--   'send-reservation-reminders',
--   '0 * * * *',  -- Every hour at minute 0
--   $$
--   SELECT net.http_post(
--     url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-reservation-reminders',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.service_role_key')
--     )
--   );
--   $$
-- );
