-- Create message_templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video', 'flex', 'carousel')),
  content JSONB NOT NULL,
  variables TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_message_templates_user_id ON message_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_category ON message_templates(category);
CREATE INDEX IF NOT EXISTS idx_message_templates_type ON message_templates(type);

-- Enable Row Level Security
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own templates"
  ON message_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
  ON message_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON message_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON message_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON message_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
