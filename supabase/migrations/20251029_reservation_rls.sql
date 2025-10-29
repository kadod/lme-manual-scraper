-- ========================================
-- Reservation Management RLS Policies
-- ========================================

-- ========================================
-- reservation_types policies
-- ========================================

-- Users can view reservation types in their organization
CREATE POLICY "Users can view reservation types in their organization"
ON reservation_types FOR SELECT
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

-- Public can view active reservation types (for booking form)
CREATE POLICY "Public can view active reservation types"
ON reservation_types FOR SELECT
TO anon
USING (
  status = 'active'
);

-- Members can create reservation types in their organization
CREATE POLICY "Members can create reservation types in their organization"
ON reservation_types FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = (auth.jwt() -> 'organization_id')::UUID AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'admin', 'member')
  )
);

-- Members can update reservation types in their organization
CREATE POLICY "Members can update reservation types in their organization"
ON reservation_types FOR UPDATE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

-- Admins can delete reservation types in their organization
CREATE POLICY "Admins can delete reservation types in their organization"
ON reservation_types FOR DELETE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'admin')
  )
);

-- ========================================
-- reservation_slots policies
-- ========================================

-- Users can view slots in their organization
CREATE POLICY "Users can view slots in their organization"
ON reservation_slots FOR SELECT
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

-- Public can view available slots
CREATE POLICY "Public can view available slots"
ON reservation_slots FOR SELECT
TO anon
USING (
  status IN ('available', 'full') AND
  slot_datetime > NOW()
);

-- Members can create slots in their organization
CREATE POLICY "Members can create slots in their organization"
ON reservation_slots FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = (auth.jwt() -> 'organization_id')::UUID AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'admin', 'member')
  )
);

-- Members can update slots in their organization
CREATE POLICY "Members can update slots in their organization"
ON reservation_slots FOR UPDATE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

-- Admins can delete slots in their organization
CREATE POLICY "Admins can delete slots in their organization"
ON reservation_slots FOR DELETE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'admin')
  )
);

-- ========================================
-- reservations policies
-- ========================================

-- Users can view reservations in their organization
CREATE POLICY "Users can view reservations in their organization"
ON reservations FOR SELECT
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

-- Public can create reservations (for booking form)
CREATE POLICY "Public can create reservations"
ON reservations FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM reservation_slots rs
    JOIN reservation_types rt ON rs.reservation_type_id = rt.id
    WHERE rs.id = slot_id
    AND rs.status = 'available'
    AND rs.slot_datetime > NOW()
    AND rt.status = 'active'
  )
);

-- Authenticated users can create reservations
CREATE POLICY "Authenticated users can create reservations"
ON reservations FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = (auth.jwt() -> 'organization_id')::UUID OR
  EXISTS (
    SELECT 1 FROM reservation_slots rs
    JOIN reservation_types rt ON rs.reservation_type_id = rt.id
    WHERE rs.id = slot_id
    AND rs.status = 'available'
    AND rs.slot_datetime > NOW()
    AND rt.status = 'active'
  )
);

-- Members can update reservations in their organization
CREATE POLICY "Members can update reservations in their organization"
ON reservations FOR UPDATE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

-- Public can cancel their own pending reservations (within deadline)
CREATE POLICY "Public can cancel pending reservations"
ON reservations FOR UPDATE
TO anon
USING (
  status = 'pending' AND
  EXISTS (
    SELECT 1 FROM reservation_slots rs
    JOIN reservation_types rt ON rs.reservation_type_id = rt.id
    WHERE rs.id = slot_id
    AND rs.slot_datetime > NOW() + (rt.cancellation_deadline_hours || ' hours')::INTERVAL
  )
)
WITH CHECK (
  status = 'cancelled'
);

-- Admins can delete reservations in their organization
CREATE POLICY "Admins can delete reservations in their organization"
ON reservations FOR DELETE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'admin')
  )
);

-- ========================================
-- reservation_reminders policies
-- ========================================

-- Users can view reminders in their organization
CREATE POLICY "Users can view reminders in their organization"
ON reservation_reminders FOR SELECT
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

-- System can insert/update reminders (via service role)
-- Members can create reminders in their organization
CREATE POLICY "Members can create reminders in their organization"
ON reservation_reminders FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

-- Members can update reminders in their organization
CREATE POLICY "Members can update reminders in their organization"
ON reservation_reminders FOR UPDATE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

-- Admins can delete reminders in their organization
CREATE POLICY "Admins can delete reminders in their organization"
ON reservation_reminders FOR DELETE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'admin')
  )
);
