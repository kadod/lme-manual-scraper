-- Create custom_reports table
CREATE TABLE IF NOT EXISTS custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'draft')),
  format TEXT NOT NULL CHECK (format IN ('pdf', 'csv', 'excel')),
  date_range JSONB NOT NULL DEFAULT '{"start": null, "end": null, "preset": "last30days"}',
  metrics JSONB NOT NULL DEFAULT '{"friends": false, "messages": false, "reservations": false, "forms": false, "urlTracking": false}',
  schedule JSONB,
  last_generated TIMESTAMPTZ,
  next_scheduled TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create report_history table
CREATE TABLE IF NOT EXISTS report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES custom_reports(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  format TEXT NOT NULL CHECK (format IN ('pdf', 'csv', 'excel')),
  file_url TEXT,
  file_size INTEGER,
  status TEXT NOT NULL CHECK (status IN ('generating', 'completed', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_custom_reports_user_id ON custom_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_reports_status ON custom_reports(status);
CREATE INDEX IF NOT EXISTS idx_report_history_report_id ON report_history(report_id);
CREATE INDEX IF NOT EXISTS idx_report_history_generated_at ON report_history(generated_at DESC);

-- Enable RLS
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_reports
CREATE POLICY "Users can view their own reports"
  ON custom_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
  ON custom_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON custom_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
  ON custom_reports FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for report_history
CREATE POLICY "Users can view their own report history"
  ON report_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM custom_reports
      WHERE custom_reports.id = report_history.report_id
      AND custom_reports.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create report history"
  ON report_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM custom_reports
      WHERE custom_reports.id = report_history.report_id
      AND custom_reports.user_id = auth.uid()
    )
  );

CREATE POLICY "System can update report history"
  ON report_history FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM custom_reports
      WHERE custom_reports.id = report_history.report_id
      AND custom_reports.user_id = auth.uid()
    )
  );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_custom_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER custom_reports_updated_at
  BEFORE UPDATE ON custom_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_reports_updated_at();
