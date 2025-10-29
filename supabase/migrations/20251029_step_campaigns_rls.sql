-- ========================================
-- Step Campaigns RLS Policies
-- ========================================

-- Enable RLS on step campaigns tables
ALTER TABLE step_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_campaign_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_campaign_logs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- step_campaigns policies
-- ========================================

-- Users can view campaigns in their organization
CREATE POLICY "Users can view campaigns in their organization"
ON step_campaigns FOR SELECT
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

-- Members can create campaigns in their organization
CREATE POLICY "Members can create campaigns in their organization"
ON step_campaigns FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = (auth.jwt() -> 'organization_id')::UUID AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'admin', 'member')
  )
);

-- Members can update campaigns in their organization
CREATE POLICY "Members can update campaigns in their organization"
ON step_campaigns FOR UPDATE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID
);

-- Admins can delete campaigns in their organization
CREATE POLICY "Admins can delete campaigns in their organization"
ON step_campaigns FOR DELETE
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
-- step_campaign_steps policies
-- ========================================

-- Users can view steps for campaigns in their organization
CREATE POLICY "Users can view steps in their organization"
ON step_campaign_steps FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM step_campaigns
    WHERE step_campaigns.id = step_campaign_steps.step_campaign_id
    AND step_campaigns.organization_id = (auth.jwt() -> 'organization_id')::UUID
  )
);

-- Members can insert steps for campaigns in their organization
CREATE POLICY "Members can insert steps in their organization"
ON step_campaign_steps FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM step_campaigns
    WHERE step_campaigns.id = step_campaign_steps.step_campaign_id
    AND step_campaigns.organization_id = (auth.jwt() -> 'organization_id')::UUID
  )
);

-- Members can update steps for campaigns in their organization
CREATE POLICY "Members can update steps in their organization"
ON step_campaign_steps FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM step_campaigns
    WHERE step_campaigns.id = step_campaign_steps.step_campaign_id
    AND step_campaigns.organization_id = (auth.jwt() -> 'organization_id')::UUID
  )
);

-- Members can delete steps for campaigns in their organization
CREATE POLICY "Members can delete steps in their organization"
ON step_campaign_steps FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM step_campaigns
    WHERE step_campaigns.id = step_campaign_steps.step_campaign_id
    AND step_campaigns.organization_id = (auth.jwt() -> 'organization_id')::UUID
  )
);

-- ========================================
-- step_campaign_logs policies
-- ========================================

-- Users can view logs for campaigns in their organization
CREATE POLICY "Users can view logs in their organization"
ON step_campaign_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM step_campaigns
    WHERE step_campaigns.id = step_campaign_logs.step_campaign_id
    AND step_campaigns.organization_id = (auth.jwt() -> 'organization_id')::UUID
  )
);

-- System can insert/update logs (via service role)
-- No policy needed for INSERT/UPDATE as these are done by Edge Functions with service role

-- ========================================
-- Helper Functions
-- ========================================

-- Function to update campaign statistics
CREATE OR REPLACE FUNCTION update_campaign_stats(campaign_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE step_campaigns
  SET
    total_subscribers = (
      SELECT COUNT(*)
      FROM step_campaign_logs
      WHERE step_campaign_logs.step_campaign_id = campaign_id
    ),
    active_subscribers = (
      SELECT COUNT(*)
      FROM step_campaign_logs
      WHERE step_campaign_logs.step_campaign_id = campaign_id
      AND step_campaign_logs.status = 'active'
    ),
    completed_subscribers = (
      SELECT COUNT(*)
      FROM step_campaign_logs
      WHERE step_campaign_logs.step_campaign_id = campaign_id
      AND step_campaign_logs.status = 'completed'
    ),
    updated_at = NOW()
  WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add subscriber to campaign
CREATE OR REPLACE FUNCTION add_campaign_subscriber(
  p_campaign_id UUID,
  p_line_friend_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_first_step record;
  v_next_send_at TIMESTAMPTZ;
BEGIN
  -- Get first step to calculate next send time
  SELECT * INTO v_first_step
  FROM step_campaign_steps
  WHERE step_campaign_id = p_campaign_id
  AND step_number = 1
  LIMIT 1;

  IF v_first_step IS NULL THEN
    RAISE EXCEPTION 'Campaign has no steps';
  END IF;

  -- Calculate next send time based on first step delay
  v_next_send_at := NOW();
  IF v_first_step.delay_unit = 'minutes' THEN
    v_next_send_at := v_next_send_at + (v_first_step.delay_value || ' minutes')::INTERVAL;
  ELSIF v_first_step.delay_unit = 'hours' THEN
    v_next_send_at := v_next_send_at + (v_first_step.delay_value || ' hours')::INTERVAL;
  ELSIF v_first_step.delay_unit = 'days' THEN
    v_next_send_at := v_next_send_at + (v_first_step.delay_value || ' days')::INTERVAL;
  END IF;

  -- Insert log entry
  INSERT INTO step_campaign_logs (
    step_campaign_id,
    line_friend_id,
    current_step_number,
    status,
    started_at,
    next_send_at
  ) VALUES (
    p_campaign_id,
    p_line_friend_id,
    0, -- Start at 0, will be incremented to 1 on first send
    'active',
    NOW(),
    v_next_send_at
  )
  ON CONFLICT (step_campaign_id, line_friend_id) DO NOTHING
  RETURNING id INTO v_log_id;

  -- Update campaign stats
  PERFORM update_campaign_stats(p_campaign_id);

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-add friends to campaign on trigger event
CREATE OR REPLACE FUNCTION handle_campaign_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_campaign record;
BEGIN
  -- Find active campaigns with matching trigger
  FOR v_campaign IN
    SELECT id, trigger_type, trigger_config
    FROM step_campaigns
    WHERE status = 'active'
    AND organization_id = NEW.organization_id
  LOOP
    -- Friend add trigger
    IF v_campaign.trigger_type = 'friend_add' AND TG_TABLE_NAME = 'line_friends' THEN
      PERFORM add_campaign_subscriber(v_campaign.id, NEW.id);
    END IF;

    -- Tag add trigger
    IF v_campaign.trigger_type = 'tag_add' AND TG_TABLE_NAME = 'friend_tags' THEN
      -- Check if tag matches
      IF v_campaign.trigger_config->>'tag_id' = NEW.tag_id::TEXT THEN
        PERFORM add_campaign_subscriber(v_campaign.id, NEW.line_friend_id);
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_campaign_on_friend_add ON line_friends;
CREATE TRIGGER trigger_campaign_on_friend_add
  AFTER INSERT ON line_friends
  FOR EACH ROW
  WHEN (NEW.follow_status = 'following')
  EXECUTE FUNCTION handle_campaign_trigger();

DROP TRIGGER IF EXISTS trigger_campaign_on_tag_add ON friend_tags;
CREATE TRIGGER trigger_campaign_on_tag_add
  AFTER INSERT ON friend_tags
  FOR EACH ROW
  EXECUTE FUNCTION handle_campaign_trigger();

-- ========================================
-- Indexes for performance
-- ========================================

-- Index for cron job query
CREATE INDEX IF NOT EXISTS idx_step_campaign_logs_active_next_send
ON step_campaign_logs (next_send_at)
WHERE status = 'active';

-- Index for campaign statistics
CREATE INDEX IF NOT EXISTS idx_step_campaign_logs_campaign_status
ON step_campaign_logs (step_campaign_id, status);
