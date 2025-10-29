-- AI Settings and Usage Tracking Tables
-- Stores OpenAI configuration and usage metrics

-- AI Settings table
CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- OpenAI Configuration
  openai_api_key TEXT, -- Encrypted
  openai_org_id TEXT,
  model VARCHAR(100) DEFAULT 'gpt-4-turbo-preview',
  temperature DECIMAL(3, 2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,

  -- System Prompt Configuration
  system_prompt TEXT,
  custom_instructions TEXT,

  -- Feature Flags
  is_enabled BOOLEAN DEFAULT false,
  stream_responses BOOLEAN DEFAULT false,

  -- Cost Management
  monthly_token_limit INTEGER DEFAULT 100000,
  monthly_budget_usd DECIMAL(10, 2) DEFAULT 100.00,

  -- Prohibited Content
  prohibited_words TEXT[] DEFAULT ARRAY[]::TEXT[],
  max_response_length INTEGER DEFAULT 5000, -- LINE message limit

  -- Fallback Responses
  default_response TEXT DEFAULT 'お問い合わせありがとうございます。少々お待ちください。',
  timeout_response TEXT DEFAULT '申し訳ございません。ただいま応答できません。',
  error_response TEXT DEFAULT 'エラーが発生しました。後ほどお試しください。',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Usage Logs table
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES friends(id) ON DELETE SET NULL,

  -- Request Details
  model VARCHAR(100) NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,

  -- Cost Tracking
  estimated_cost_usd DECIMAL(10, 6),

  -- Response Metadata
  response_time_ms INTEGER,
  status VARCHAR(50) NOT NULL, -- success, error, timeout, rate_limit
  error_message TEXT,

  -- Context
  message_text TEXT,
  response_text TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Conversation History table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,

  -- Conversation Data
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Metadata
  tokens INTEGER,
  model VARCHAR(100),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_settings_user_id ON ai_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_friend_id ON ai_conversations(friend_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at);

-- RLS Policies
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- AI Settings policies
CREATE POLICY "Users can view own ai_settings"
  ON ai_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai_settings"
  ON ai_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai_settings"
  ON ai_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- AI Usage Logs policies
CREATE POLICY "Users can view own ai_usage_logs"
  ON ai_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert ai_usage_logs"
  ON ai_usage_logs FOR INSERT
  WITH CHECK (true);

-- AI Conversations policies
CREATE POLICY "Users can view own ai_conversations"
  ON ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert ai_conversations"
  ON ai_conversations FOR INSERT
  WITH CHECK (true);

-- Helper function to get monthly token usage
CREATE OR REPLACE FUNCTION get_monthly_token_usage(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(total_tokens), 0)
    FROM ai_usage_logs
    WHERE user_id = p_user_id
      AND created_at >= date_trunc('month', NOW())
      AND status = 'success'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get monthly cost
CREATE OR REPLACE FUNCTION get_monthly_ai_cost(p_user_id UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(estimated_cost_usd), 0)
    FROM ai_usage_logs
    WHERE user_id = p_user_id
      AND created_at >= date_trunc('month', NOW())
      AND status = 'success'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user can use AI
CREATE OR REPLACE FUNCTION can_use_ai(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_settings RECORD;
  v_monthly_tokens INTEGER;
  v_monthly_cost DECIMAL;
BEGIN
  -- Get AI settings
  SELECT * INTO v_settings
  FROM ai_settings
  WHERE user_id = p_user_id
  LIMIT 1;

  -- Check if AI is enabled
  IF v_settings IS NULL OR NOT v_settings.is_enabled THEN
    RETURN FALSE;
  END IF;

  -- Get monthly usage
  v_monthly_tokens := get_monthly_token_usage(p_user_id);
  v_monthly_cost := get_monthly_ai_cost(p_user_id);

  -- Check limits
  IF v_monthly_tokens >= v_settings.monthly_token_limit THEN
    RETURN FALSE;
  END IF;

  IF v_monthly_cost >= v_settings.monthly_budget_usd THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversation history
CREATE OR REPLACE FUNCTION get_conversation_history(
  p_friend_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  role VARCHAR,
  content TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.role,
    c.content,
    c.created_at
  FROM ai_conversations c
  WHERE c.friend_id = p_friend_id
  ORDER BY c.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at trigger for ai_settings
CREATE OR REPLACE FUNCTION update_ai_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_settings_updated_at
  BEFORE UPDATE ON ai_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_settings_updated_at();
