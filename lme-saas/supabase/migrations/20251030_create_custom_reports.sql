-- Custom Reports Table
-- Allows organizations to create and schedule custom analytics reports

CREATE TABLE IF NOT EXISTS custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Report information
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL,

  -- Report configuration
  config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Scheduling
  schedule TEXT, -- cron expression
  schedule_enabled BOOLEAN DEFAULT false,
  last_generated_at TIMESTAMPTZ,
  next_scheduled_at TIMESTAMPTZ,

  -- Output configuration
  output_format TEXT DEFAULT 'pdf',
  recipients TEXT[] DEFAULT '{}',
  webhook_url TEXT,

  -- Data range settings
  date_range_type TEXT DEFAULT 'last_30_days',
  custom_start_date DATE,
  custom_end_date DATE,

  -- Filters
  filters JSONB DEFAULT '{}'::jsonb,

  -- Visualization settings
  chart_types TEXT[] DEFAULT '{}',
  include_charts BOOLEAN DEFAULT true,
  include_raw_data BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_favorite BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Constraints
  CONSTRAINT valid_report_type CHECK (
    report_type IN (
      'overview',
      'messages',
      'campaigns',
      'segments',
      'forms',
      'reservations',
      'url_tracking',
      'revenue',
      'engagement',
      'custom'
    )
  ),
  CONSTRAINT valid_output_format CHECK (
    output_format IN ('pdf', 'csv', 'excel', 'json', 'html')
  ),
  CONSTRAINT valid_date_range_type CHECK (
    date_range_type IN (
      'today',
      'yesterday',
      'last_7_days',
      'last_30_days',
      'last_90_days',
      'this_month',
      'last_month',
      'this_quarter',
      'last_quarter',
      'this_year',
      'last_year',
      'custom'
    )
  ),
  CONSTRAINT custom_dates_required CHECK (
    (date_range_type = 'custom' AND custom_start_date IS NOT NULL AND custom_end_date IS NOT NULL)
    OR date_range_type != 'custom'
  )
);

-- Indexes
CREATE INDEX idx_custom_reports_org_id ON custom_reports(organization_id);
CREATE INDEX idx_custom_reports_type ON custom_reports(report_type);
CREATE INDEX idx_custom_reports_active ON custom_reports(organization_id, is_active) WHERE is_active = true;
CREATE INDEX idx_custom_reports_scheduled ON custom_reports(next_scheduled_at) WHERE schedule_enabled = true;
CREATE INDEX idx_custom_reports_favorite ON custom_reports(organization_id, is_favorite) WHERE is_favorite = true;

-- GIN indexes for JSONB fields
CREATE INDEX idx_custom_reports_config ON custom_reports USING gin(config);
CREATE INDEX idx_custom_reports_filters ON custom_reports USING gin(filters);

-- Report Executions Table
-- Tracks report generation history
CREATE TABLE IF NOT EXISTS report_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES custom_reports(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Execution details
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  -- Date range used for this execution
  date_range_start DATE,
  date_range_end DATE,

  -- Output
  file_url TEXT,
  file_size BIGINT,
  row_count INTEGER,

  -- Error handling
  error_message TEXT,
  error_details JSONB,

  -- Metadata
  triggered_by TEXT DEFAULT 'manual',
  triggered_by_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  CONSTRAINT valid_execution_status CHECK (
    status IN ('pending', 'running', 'completed', 'failed', 'cancelled')
  ),
  CONSTRAINT valid_triggered_by CHECK (
    triggered_by IN ('manual', 'scheduled', 'api', 'webhook')
  )
);

-- Indexes for report executions
CREATE INDEX idx_report_executions_report_id ON report_executions(report_id);
CREATE INDEX idx_report_executions_org_id ON report_executions(organization_id);
CREATE INDEX idx_report_executions_status ON report_executions(status);
CREATE INDEX idx_report_executions_started_at ON report_executions(started_at DESC);
CREATE INDEX idx_report_executions_report_date ON report_executions(report_id, started_at DESC);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_custom_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_custom_reports_updated_at
  BEFORE UPDATE ON custom_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_reports_updated_at();

-- Function to calculate next scheduled run
CREATE OR REPLACE FUNCTION calculate_next_schedule(p_schedule TEXT, p_from TIMESTAMPTZ DEFAULT now())
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_next_run TIMESTAMPTZ;
BEGIN
  -- Simple cron parsing (extend as needed)
  -- Format: "0 9 * * *" (minute hour day month weekday)

  -- For now, support common patterns
  CASE p_schedule
    WHEN '0 9 * * *' THEN -- Daily at 9 AM
      v_next_run := date_trunc('day', p_from + interval '1 day') + interval '9 hours';
    WHEN '0 9 * * 1' THEN -- Weekly on Monday at 9 AM
      v_next_run := date_trunc('week', p_from + interval '1 week') + interval '9 hours';
    WHEN '0 9 1 * *' THEN -- Monthly on 1st at 9 AM
      v_next_run := date_trunc('month', p_from + interval '1 month') + interval '9 hours';
    ELSE
      -- Default to 24 hours from now
      v_next_run := p_from + interval '24 hours';
  END CASE;

  RETURN v_next_run;
END;
$$ LANGUAGE plpgsql;

-- Function to generate a report
CREATE OR REPLACE FUNCTION generate_report(
  p_report_id UUID,
  p_triggered_by TEXT DEFAULT 'manual',
  p_triggered_by_user UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_execution_id UUID;
  v_report RECORD;
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  -- Get report details
  SELECT * INTO v_report
  FROM custom_reports
  WHERE id = p_report_id AND is_active = true;

  IF v_report IS NULL THEN
    RAISE EXCEPTION 'Report not found or inactive: %', p_report_id;
  END IF;

  -- Calculate date range
  CASE v_report.date_range_type
    WHEN 'today' THEN
      v_start_date := CURRENT_DATE;
      v_end_date := CURRENT_DATE;
    WHEN 'yesterday' THEN
      v_start_date := CURRENT_DATE - 1;
      v_end_date := CURRENT_DATE - 1;
    WHEN 'last_7_days' THEN
      v_start_date := CURRENT_DATE - 7;
      v_end_date := CURRENT_DATE - 1;
    WHEN 'last_30_days' THEN
      v_start_date := CURRENT_DATE - 30;
      v_end_date := CURRENT_DATE - 1;
    WHEN 'custom' THEN
      v_start_date := v_report.custom_start_date;
      v_end_date := v_report.custom_end_date;
    ELSE
      v_start_date := CURRENT_DATE - 30;
      v_end_date := CURRENT_DATE - 1;
  END CASE;

  -- Create execution record
  INSERT INTO report_executions (
    report_id,
    organization_id,
    status,
    date_range_start,
    date_range_end,
    triggered_by,
    triggered_by_user
  ) VALUES (
    p_report_id,
    v_report.organization_id,
    'pending',
    v_start_date,
    v_end_date,
    p_triggered_by,
    p_triggered_by_user
  )
  RETURNING id INTO v_execution_id;

  -- Update report last_generated_at
  UPDATE custom_reports
  SET
    last_generated_at = now(),
    next_scheduled_at = CASE
      WHEN schedule_enabled AND schedule IS NOT NULL
      THEN calculate_next_schedule(schedule)
      ELSE NULL
    END
  WHERE id = p_report_id;

  RETURN v_execution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get scheduled reports that need to run
CREATE OR REPLACE FUNCTION get_due_scheduled_reports()
RETURNS TABLE (
  report_id UUID,
  organization_id UUID,
  report_name TEXT,
  schedule TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id,
    custom_reports.organization_id,
    name,
    custom_reports.schedule
  FROM custom_reports
  WHERE
    is_active = true
    AND schedule_enabled = true
    AND next_scheduled_at IS NOT NULL
    AND next_scheduled_at <= now();
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE custom_reports IS 'Custom analytics reports that can be generated on-demand or scheduled';
COMMENT ON COLUMN custom_reports.config IS 'Report-specific configuration including metrics, dimensions, and formatting';
COMMENT ON COLUMN custom_reports.schedule IS 'Cron expression for scheduled report generation';
COMMENT ON COLUMN custom_reports.filters IS 'Filters to apply to the report data (e.g., specific campaigns, segments, date ranges)';
COMMENT ON TABLE report_executions IS 'History of report generation executions';
COMMENT ON FUNCTION generate_report IS 'Generates a custom report and creates an execution record';
COMMENT ON FUNCTION get_due_scheduled_reports IS 'Returns reports that are due to be generated based on their schedule';
