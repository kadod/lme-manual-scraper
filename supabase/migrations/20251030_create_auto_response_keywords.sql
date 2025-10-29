-- Auto Response Keywords Table
-- Stores keyword definitions for simple keyword-based auto responses

CREATE TABLE IF NOT EXISTS auto_response_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES auto_response_rules(id) ON DELETE CASCADE,

  -- Keyword Configuration
  keyword TEXT NOT NULL,
  match_type VARCHAR(50) NOT NULL CHECK (match_type IN ('exact', 'partial', 'regex', 'prefix', 'suffix')),
  case_sensitive BOOLEAN NOT NULL DEFAULT false,

  -- Response Configuration
  response_type VARCHAR(50) NOT NULL CHECK (response_type IN ('text', 'template', 'flex', 'image', 'video')),
  response_content JSONB NOT NULL,
  -- Example for text: { "text": "Thank you for your message!" }
  -- Example for template: { "template_id": "uuid", "variables": {"name": "{{user.name}}"} }
  -- Example for flex: { "altText": "Menu", "contents": {...} }

  -- Priority within rule
  priority INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_keyword_priority CHECK (priority >= 0)
);

-- Indexes
CREATE INDEX idx_auto_response_keywords_rule_id ON auto_response_keywords(rule_id);
CREATE INDEX idx_auto_response_keywords_keyword ON auto_response_keywords(keyword);
CREATE INDEX idx_auto_response_keywords_match_type ON auto_response_keywords(match_type);
CREATE INDEX idx_auto_response_keywords_response_type ON auto_response_keywords(response_type);
CREATE INDEX idx_auto_response_keywords_priority ON auto_response_keywords(rule_id, priority DESC);

-- GIN index for response content
CREATE INDEX idx_auto_response_keywords_content ON auto_response_keywords USING GIN (response_content);

-- Text search index for keyword matching
CREATE INDEX idx_auto_response_keywords_keyword_trgm ON auto_response_keywords USING GIN (keyword gin_trgm_ops);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_auto_response_keywords_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_response_keywords_updated_at
  BEFORE UPDATE ON auto_response_keywords
  FOR EACH ROW
  EXECUTE FUNCTION update_auto_response_keywords_updated_at();

-- Comments
COMMENT ON TABLE auto_response_keywords IS 'Keyword definitions for automated responses';
COMMENT ON COLUMN auto_response_keywords.match_type IS 'How to match the keyword: exact, partial, regex, prefix, suffix';
COMMENT ON COLUMN auto_response_keywords.response_content IS 'Response message content in JSON format';
COMMENT ON COLUMN auto_response_keywords.priority IS 'Priority when multiple keywords match';
