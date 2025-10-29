-- ========================================
-- Forms and Form Responses Tables
-- ========================================

-- Forms table
CREATE TABLE IF NOT EXISTS forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]'::JSONB,
  settings JSONB DEFAULT '{}'::JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Form responses table
CREATE TABLE IF NOT EXISTS form_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  line_friend_id UUID,
  response_data JSONB NOT NULL DEFAULT '{}'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB, -- device, browser, ip, etc.
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  completion_time_seconds INTEGER, -- time to complete
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form analytics aggregations table (for caching)
CREATE TABLE IF NOT EXISTS form_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_responses INTEGER DEFAULT 0,
  completed_responses INTEGER DEFAULT 0,
  abandoned_responses INTEGER DEFAULT 0,
  avg_completion_time_seconds DECIMAL,
  field_statistics JSONB DEFAULT '{}'::JSONB,
  device_statistics JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(form_id, date)
);

-- ========================================
-- Indexes for performance
-- ========================================

-- Forms indexes
CREATE INDEX IF NOT EXISTS idx_forms_organization_id ON forms(organization_id);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_created_at ON forms(created_at DESC);

-- Form responses indexes
CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_line_friend_id ON form_responses(line_friend_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted_at ON form_responses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_responses_form_submitted ON form_responses(form_id, submitted_at DESC);

-- Form analytics indexes
CREATE INDEX IF NOT EXISTS idx_form_analytics_form_date ON form_analytics(form_id, date DESC);

-- ========================================
-- Row Level Security
-- ========================================

-- Enable RLS
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_analytics ENABLE ROW LEVEL SECURITY;

-- Forms policies
CREATE POLICY "Users can view forms in their organization"
ON forms FOR SELECT
TO authenticated
USING (organization_id = (auth.jwt() -> 'organization_id')::UUID);

CREATE POLICY "Members can create forms in their organization"
ON forms FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = (auth.jwt() -> 'organization_id')::UUID AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'admin', 'member')
  )
);

CREATE POLICY "Members can update forms in their organization"
ON forms FOR UPDATE
TO authenticated
USING (organization_id = (auth.jwt() -> 'organization_id')::UUID);

CREATE POLICY "Admins can delete forms in their organization"
ON forms FOR DELETE
TO authenticated
USING (
  organization_id = (auth.jwt() -> 'organization_id')::UUID AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'admin')
  )
);

-- Form responses policies
CREATE POLICY "Users can view responses for their organization's forms"
ON form_responses FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = form_responses.form_id
    AND forms.organization_id = (auth.jwt() -> 'organization_id')::UUID
  )
);

CREATE POLICY "System can insert responses"
ON form_responses FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = form_responses.form_id
    AND forms.status = 'active'
  )
);

-- Form analytics policies
CREATE POLICY "Users can view analytics for their organization's forms"
ON form_analytics FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = form_analytics.form_id
    AND forms.organization_id = (auth.jwt() -> 'organization_id')::UUID
  )
);

-- ========================================
-- Helper Functions
-- ========================================

-- Function to calculate form statistics
CREATE OR REPLACE FUNCTION calculate_form_statistics(p_form_id UUID, p_date DATE)
RETURNS void AS $$
DECLARE
  v_total_responses INTEGER;
  v_completed_responses INTEGER;
  v_abandoned_responses INTEGER;
  v_avg_completion_time DECIMAL;
  v_field_stats JSONB;
  v_device_stats JSONB;
BEGIN
  -- Count responses
  SELECT COUNT(*) INTO v_total_responses
  FROM form_responses
  WHERE form_id = p_form_id
  AND DATE(submitted_at) = p_date;

  -- Count completed responses (has submitted_at)
  SELECT COUNT(*) INTO v_completed_responses
  FROM form_responses
  WHERE form_id = p_form_id
  AND DATE(submitted_at) = p_date
  AND submitted_at IS NOT NULL;

  -- Calculate abandoned (started but not completed)
  v_abandoned_responses := v_total_responses - v_completed_responses;

  -- Calculate average completion time
  SELECT AVG(completion_time_seconds) INTO v_avg_completion_time
  FROM form_responses
  WHERE form_id = p_form_id
  AND DATE(submitted_at) = p_date
  AND completion_time_seconds IS NOT NULL;

  -- Calculate device statistics
  SELECT jsonb_object_agg(
    COALESCE(metadata->>'device', 'unknown'),
    count
  ) INTO v_device_stats
  FROM (
    SELECT
      metadata->>'device' as device,
      COUNT(*)::INTEGER as count
    FROM form_responses
    WHERE form_id = p_form_id
    AND DATE(submitted_at) = p_date
    GROUP BY metadata->>'device'
  ) sub;

  -- Insert or update analytics
  INSERT INTO form_analytics (
    form_id,
    date,
    total_responses,
    completed_responses,
    abandoned_responses,
    avg_completion_time_seconds,
    device_statistics,
    updated_at
  ) VALUES (
    p_form_id,
    p_date,
    v_total_responses,
    v_completed_responses,
    v_abandoned_responses,
    v_avg_completion_time,
    COALESCE(v_device_stats, '{}'::JSONB),
    NOW()
  )
  ON CONFLICT (form_id, date) DO UPDATE SET
    total_responses = EXCLUDED.total_responses,
    completed_responses = EXCLUDED.completed_responses,
    abandoned_responses = EXCLUDED.abandoned_responses,
    avg_completion_time_seconds = EXCLUDED.avg_completion_time_seconds,
    device_statistics = EXCLUDED.device_statistics,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to aggregate field responses
CREATE OR REPLACE FUNCTION aggregate_field_responses(
  p_form_id UUID,
  p_field_id TEXT,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_field_type TEXT;
  v_result JSONB;
BEGIN
  -- Get field type from form definition
  SELECT field->>'type' INTO v_field_type
  FROM forms,
       jsonb_array_elements(fields) as field
  WHERE forms.id = p_form_id
  AND field->>'id' = p_field_id;

  -- Aggregate based on field type
  CASE v_field_type
    WHEN 'select', 'radio', 'checkbox' THEN
      -- For choice fields, count each option
      SELECT jsonb_object_agg(
        value,
        count
      ) INTO v_result
      FROM (
        SELECT
          response_data->p_field_id as value,
          COUNT(*)::INTEGER as count
        FROM form_responses
        WHERE form_id = p_form_id
        AND (p_start_date IS NULL OR DATE(submitted_at) >= p_start_date)
        AND (p_end_date IS NULL OR DATE(submitted_at) <= p_end_date)
        AND response_data ? p_field_id
        GROUP BY response_data->p_field_id
        ORDER BY count DESC
      ) sub;

    WHEN 'number' THEN
      -- For number fields, calculate statistics
      SELECT jsonb_build_object(
        'count', COUNT(*)::INTEGER,
        'sum', SUM((response_data->>p_field_id)::DECIMAL),
        'avg', AVG((response_data->>p_field_id)::DECIMAL),
        'min', MIN((response_data->>p_field_id)::DECIMAL),
        'max', MAX((response_data->>p_field_id)::DECIMAL),
        'median', PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (response_data->>p_field_id)::DECIMAL)
      ) INTO v_result
      FROM form_responses
      WHERE form_id = p_form_id
      AND (p_start_date IS NULL OR DATE(submitted_at) >= p_start_date)
      AND (p_end_date IS NULL OR DATE(submitted_at) <= p_end_date)
      AND response_data ? p_field_id
      AND response_data->>p_field_id ~ '^[0-9.]+$';

    ELSE
      -- For text fields, just count responses
      SELECT jsonb_build_object(
        'count', COUNT(*)::INTEGER,
        'sample_responses', jsonb_agg(response_data->>p_field_id)
      ) INTO v_result
      FROM (
        SELECT response_data->>p_field_id
        FROM form_responses
        WHERE form_id = p_form_id
        AND (p_start_date IS NULL OR DATE(submitted_at) >= p_start_date)
        AND (p_end_date IS NULL OR DATE(submitted_at) <= p_end_date)
        AND response_data ? p_field_id
        LIMIT 100
      ) sub;
  END CASE;

  RETURN COALESCE(v_result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update analytics on new response
CREATE OR REPLACE FUNCTION update_analytics_on_response()
RETURNS TRIGGER AS $$
BEGIN
  -- Update analytics for the date of the response
  PERFORM calculate_form_statistics(
    NEW.form_id,
    DATE(NEW.submitted_at)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_analytics ON form_responses;
CREATE TRIGGER trigger_update_analytics
  AFTER INSERT OR UPDATE ON form_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_on_response();

-- Function to get response trends
CREATE OR REPLACE FUNCTION get_response_trends(
  p_form_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  total_responses BIGINT,
  completed_responses BIGINT,
  avg_completion_time DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(submitted_at) as date,
    COUNT(*) as total_responses,
    COUNT(*) FILTER (WHERE submitted_at IS NOT NULL) as completed_responses,
    AVG(completion_time_seconds) as avg_completion_time
  FROM form_responses
  WHERE form_id = p_form_id
  AND submitted_at >= CURRENT_DATE - p_days
  GROUP BY DATE(submitted_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
