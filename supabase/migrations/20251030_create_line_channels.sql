-- Create line_channels table
CREATE TABLE IF NOT EXISTS public.line_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL UNIQUE,
  channel_secret TEXT NOT NULL,
  access_token TEXT NOT NULL,
  channel_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_line_channels_user_id ON public.line_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_line_channels_channel_id ON public.line_channels(channel_id);

-- Enable RLS
ALTER TABLE public.line_channels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own line channels"
  ON public.line_channels
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own line channels"
  ON public.line_channels
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own line channels"
  ON public.line_channels
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own line channels"
  ON public.line_channels
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_line_channels_updated_at
  BEFORE UPDATE ON public.line_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
