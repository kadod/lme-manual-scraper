-- Create reservation types table
CREATE TABLE reservation_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  buffer_minutes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create available slots table
CREATE TABLE available_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_type_id UUID NOT NULL REFERENCES reservation_types(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  booked_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'unavailable')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_booked_capacity CHECK (booked_count <= capacity),
  CONSTRAINT check_time_order CHECK (start_time < end_time)
);

-- Create reservations table
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_type_id UUID NOT NULL REFERENCES reservation_types(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES available_slots(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES friends(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_memo TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  line_user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_reservation_types_user_id ON reservation_types(user_id);
CREATE INDEX idx_reservation_types_status ON reservation_types(status);
CREATE INDEX idx_available_slots_reservation_type_id ON available_slots(reservation_type_id);
CREATE INDEX idx_available_slots_start_time ON available_slots(start_time);
CREATE INDEX idx_available_slots_status ON available_slots(status);
CREATE INDEX idx_reservations_reservation_type_id ON reservations(reservation_type_id);
CREATE INDEX idx_reservations_slot_id ON reservations(slot_id);
CREATE INDEX idx_reservations_friend_id ON reservations(friend_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_line_user_id ON reservations(line_user_id);

-- Enable RLS
ALTER TABLE reservation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reservation_types
CREATE POLICY "Users can view their own reservation types"
  ON reservation_types FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reservation types"
  ON reservation_types FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservation types"
  ON reservation_types FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reservation types"
  ON reservation_types FOR DELETE
  USING (auth.uid() = user_id);

-- Public can view active reservation types
CREATE POLICY "Public can view active reservation types"
  ON reservation_types FOR SELECT
  USING (status = 'active');

-- RLS Policies for available_slots
CREATE POLICY "Users can manage their slots"
  ON available_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM reservation_types
      WHERE reservation_types.id = available_slots.reservation_type_id
      AND reservation_types.user_id = auth.uid()
    )
  );

-- Public can view available slots
CREATE POLICY "Public can view available slots"
  ON available_slots FOR SELECT
  USING (
    status = 'available'
    AND booked_count < capacity
    AND EXISTS (
      SELECT 1 FROM reservation_types
      WHERE reservation_types.id = available_slots.reservation_type_id
      AND reservation_types.status = 'active'
    )
  );

-- RLS Policies for reservations
CREATE POLICY "Users can view their reservations"
  ON reservations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reservation_types
      WHERE reservation_types.id = reservations.reservation_type_id
      AND reservation_types.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their reservations"
  ON reservations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM reservation_types
      WHERE reservation_types.id = reservations.reservation_type_id
      AND reservation_types.user_id = auth.uid()
    )
  );

-- Public can create reservations (no auth required)
CREATE POLICY "Public can create reservations"
  ON reservations FOR INSERT
  WITH CHECK (true);

-- Function to update slot booked count
CREATE OR REPLACE FUNCTION update_slot_booked_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE available_slots
    SET booked_count = booked_count + 1,
        updated_at = NOW()
    WHERE id = NEW.slot_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE available_slots
    SET booked_count = booked_count - 1,
        updated_at = NOW()
    WHERE id = OLD.slot_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
    UPDATE available_slots
    SET booked_count = booked_count - 1,
        updated_at = NOW()
    WHERE id = NEW.slot_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'cancelled' AND NEW.status = 'confirmed' THEN
    UPDATE available_slots
    SET booked_count = booked_count + 1,
        updated_at = NOW()
    WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update slot booked count
CREATE TRIGGER trigger_update_slot_booked_count
AFTER INSERT OR UPDATE OR DELETE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_slot_booked_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_reservation_types_updated_at
BEFORE UPDATE ON reservation_types
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_available_slots_updated_at
BEFORE UPDATE ON available_slots
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
