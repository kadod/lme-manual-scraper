-- ========================================
-- Reservation Helper Functions
-- ========================================

-- Function to get available slots for a reservation type
CREATE OR REPLACE FUNCTION get_available_slots(
  p_reservation_type_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_end_date DATE DEFAULT NULL,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  slot_id UUID,
  slot_datetime TIMESTAMPTZ,
  end_datetime TIMESTAMPTZ,
  capacity INTEGER,
  booked_count INTEGER,
  available_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    rs.id AS slot_id,
    rs.slot_datetime,
    rs.end_datetime,
    rs.capacity,
    rs.booked_count,
    (rs.capacity - rs.booked_count) AS available_count
  FROM reservation_slots rs
  WHERE rs.reservation_type_id = p_reservation_type_id
    AND rs.status = 'available'
    AND rs.slot_datetime >= p_start_date::TIMESTAMPTZ
    AND (p_end_date IS NULL OR rs.slot_datetime < (p_end_date + INTERVAL '1 day')::TIMESTAMPTZ)
    AND rs.slot_datetime > NOW()
    AND rs.booked_count < rs.capacity
  ORDER BY rs.slot_datetime
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check slot availability
CREATE OR REPLACE FUNCTION check_slot_availability(
  p_slot_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_slot record;
  v_reservation_type record;
BEGIN
  -- Get slot details
  SELECT * INTO v_slot
  FROM reservation_slots
  WHERE id = p_slot_id;

  IF v_slot IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get reservation type details
  SELECT * INTO v_reservation_type
  FROM reservation_types
  WHERE id = v_slot.reservation_type_id;

  IF v_reservation_type IS NULL OR v_reservation_type.status != 'active' THEN
    RETURN FALSE;
  END IF;

  -- Check if slot is available
  IF v_slot.status != 'available' THEN
    RETURN FALSE;
  END IF;

  -- Check if slot is in the past
  IF v_slot.slot_datetime <= NOW() THEN
    RETURN FALSE;
  END IF;

  -- Check if slot has capacity
  IF v_slot.booked_count >= v_slot.capacity THEN
    RETURN FALSE;
  END IF;

  -- Check if within advance booking window
  IF v_slot.slot_datetime > NOW() + (v_reservation_type.advance_booking_days || ' days')::INTERVAL THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to create reservation with validation
CREATE OR REPLACE FUNCTION create_reservation(
  p_slot_id UUID,
  p_customer_name TEXT,
  p_customer_phone TEXT DEFAULT NULL,
  p_customer_email TEXT DEFAULT NULL,
  p_customer_line_user_id TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_reservation_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_reservation_id UUID;
  v_slot record;
  v_organization_id UUID;
BEGIN
  -- Get slot details with lock
  SELECT rs.*, rt.organization_id INTO v_slot
  FROM reservation_slots rs
  JOIN reservation_types rt ON rs.reservation_type_id = rt.id
  WHERE rs.id = p_slot_id
  FOR UPDATE;

  IF v_slot IS NULL THEN
    RAISE EXCEPTION 'Slot not found';
  END IF;

  -- Check availability
  IF NOT check_slot_availability(p_slot_id) THEN
    RAISE EXCEPTION 'Slot is not available';
  END IF;

  v_organization_id := v_slot.organization_id;

  -- Create reservation
  INSERT INTO reservations (
    organization_id,
    reservation_type_id,
    slot_id,
    customer_name,
    customer_phone,
    customer_email,
    customer_line_user_id,
    notes,
    reservation_data,
    status
  ) VALUES (
    v_organization_id,
    v_slot.reservation_type_id,
    p_slot_id,
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    p_customer_line_user_id,
    p_notes,
    p_reservation_data,
    'pending'
  )
  RETURNING id INTO v_reservation_id;

  RETURN v_reservation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel reservation
CREATE OR REPLACE FUNCTION cancel_reservation(
  p_reservation_id UUID,
  p_cancellation_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_reservation record;
  v_slot record;
  v_reservation_type record;
  v_cancellation_deadline TIMESTAMPTZ;
BEGIN
  -- Get reservation details
  SELECT * INTO v_reservation
  FROM reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF v_reservation IS NULL THEN
    RAISE EXCEPTION 'Reservation not found';
  END IF;

  IF v_reservation.status NOT IN ('pending', 'confirmed') THEN
    RAISE EXCEPTION 'Reservation cannot be cancelled (status: %)', v_reservation.status;
  END IF;

  -- Get slot and type details
  SELECT rs.*, rt.cancellation_deadline_hours INTO v_slot
  FROM reservation_slots rs
  JOIN reservation_types rt ON rs.reservation_type_id = rt.id
  WHERE rs.id = v_reservation.slot_id;

  -- Check cancellation deadline
  v_cancellation_deadline := v_slot.slot_datetime - (v_slot.cancellation_deadline_hours || ' hours')::INTERVAL;

  IF NOW() > v_cancellation_deadline THEN
    RAISE EXCEPTION 'Cancellation deadline has passed';
  END IF;

  -- Update reservation
  UPDATE reservations
  SET
    status = 'cancelled',
    cancelled_at = NOW(),
    cancellation_reason = p_cancellation_reason,
    updated_at = NOW()
  WHERE id = p_reservation_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to confirm reservation
CREATE OR REPLACE FUNCTION confirm_reservation(
  p_reservation_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE reservations
  SET
    status = 'confirmed',
    confirmed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_reservation_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found or already confirmed';
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate slots for a date range
CREATE OR REPLACE FUNCTION generate_reservation_slots(
  p_reservation_type_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 0=Sunday, 1=Monday, etc.
  p_capacity INTEGER DEFAULT 1
)
RETURNS INTEGER AS $$
DECLARE
  v_reservation_type record;
  v_current_date DATE;
  v_current_datetime TIMESTAMPTZ;
  v_end_datetime TIMESTAMPTZ;
  v_slots_created INTEGER := 0;
  v_organization_id UUID;
BEGIN
  -- Get reservation type details
  SELECT * INTO v_reservation_type
  FROM reservation_types
  WHERE id = p_reservation_type_id;

  IF v_reservation_type IS NULL THEN
    RAISE EXCEPTION 'Reservation type not found';
  END IF;

  v_organization_id := v_reservation_type.organization_id;

  -- Loop through each date
  v_current_date := p_start_date;
  WHILE v_current_date <= p_end_date LOOP
    -- Check if current day is in allowed days of week
    IF EXTRACT(DOW FROM v_current_date)::INTEGER = ANY(p_days_of_week) THEN
      -- Generate slots for this day
      v_current_datetime := v_current_date + p_start_time;
      WHILE v_current_datetime::TIME < p_end_time LOOP
        v_end_datetime := v_current_datetime + (v_reservation_type.duration_minutes || ' minutes')::INTERVAL;

        -- Insert slot if it doesn't exist
        INSERT INTO reservation_slots (
          organization_id,
          reservation_type_id,
          slot_datetime,
          end_datetime,
          capacity,
          status
        ) VALUES (
          v_organization_id,
          p_reservation_type_id,
          v_current_datetime,
          v_end_datetime,
          p_capacity,
          'available'
        )
        ON CONFLICT (reservation_type_id, slot_datetime) DO NOTHING;

        IF FOUND THEN
          v_slots_created := v_slots_created + 1;
        END IF;

        -- Move to next slot (duration + buffer)
        v_current_datetime := v_current_datetime +
          (v_reservation_type.duration_minutes + v_reservation_type.buffer_minutes || ' minutes')::INTERVAL;
      END LOOP;
    END IF;

    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;

  RETURN v_slots_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-create reminders for new reservations
CREATE OR REPLACE FUNCTION create_reservation_reminders()
RETURNS TRIGGER AS $$
DECLARE
  v_slot record;
  v_reminder_time TIMESTAMPTZ;
BEGIN
  -- Only create reminders for confirmed/pending reservations
  IF NEW.status NOT IN ('pending', 'confirmed') THEN
    RETURN NEW;
  END IF;

  -- Get slot details
  SELECT * INTO v_slot
  FROM reservation_slots
  WHERE id = NEW.slot_id;

  -- Create confirmation reminder (immediate)
  INSERT INTO reservation_reminders (
    organization_id,
    reservation_id,
    reminder_type,
    scheduled_at,
    status,
    channel
  ) VALUES (
    NEW.organization_id,
    NEW.id,
    'confirmation',
    NOW(),
    'pending',
    'line'
  );

  -- Create reminder 24 hours before appointment
  v_reminder_time := v_slot.slot_datetime - INTERVAL '24 hours';
  IF v_reminder_time > NOW() THEN
    INSERT INTO reservation_reminders (
      organization_id,
      reservation_id,
      reminder_type,
      scheduled_at,
      status,
      channel
    ) VALUES (
      NEW.organization_id,
      NEW.id,
      'reminder',
      v_reminder_time,
      'pending',
      'line'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_reservation_reminders
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION create_reservation_reminders();

-- Add comments
COMMENT ON FUNCTION get_available_slots IS 'Get available slots for a reservation type within a date range';
COMMENT ON FUNCTION check_slot_availability IS 'Check if a slot is available for booking';
COMMENT ON FUNCTION create_reservation IS 'Create a new reservation with validation';
COMMENT ON FUNCTION cancel_reservation IS 'Cancel a reservation with deadline check';
COMMENT ON FUNCTION confirm_reservation IS 'Confirm a pending reservation';
COMMENT ON FUNCTION generate_reservation_slots IS 'Generate slots for a date range based on business hours';
