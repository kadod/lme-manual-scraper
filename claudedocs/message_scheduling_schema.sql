-- ========================================
-- Messages Table Schema
-- ========================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Message Basic Information
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video', 'audio', 'flex', 'template')),
  content JSONB NOT NULL,

  -- Delivery Settings
  target_type TEXT NOT NULL CHECK (target_type IN ('all', 'segment', 'tags', 'manual')),
  target_ids UUID[],
  scheduled_at TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled')),

  -- Statistics
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_scheduled_at ON messages(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- ========================================
-- Message Recipients Table
-- ========================================

CREATE TABLE message_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  error_message TEXT,

  -- Tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(message_id, friend_id)
);

CREATE INDEX idx_message_recipients_message_id ON message_recipients(message_id);
CREATE INDEX idx_message_recipients_friend_id ON message_recipients(friend_id);
CREATE INDEX idx_message_recipients_status ON message_recipients(status);
CREATE INDEX idx_message_recipients_pending ON message_recipients(message_id, status) WHERE status = 'pending';

-- ========================================
-- RLS Policies for Messages
-- ========================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
ON messages FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own messages"
ON messages FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
ON messages FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ========================================
-- RLS Policies for Message Recipients
-- ========================================

ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recipients of their messages"
ON message_recipients FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM messages
    WHERE messages.id = message_recipients.message_id
    AND messages.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create recipients for their messages"
ON message_recipients FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM messages
    WHERE messages.id = message_recipients.message_id
    AND messages.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update recipients of their messages"
ON message_recipients FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM messages
    WHERE messages.id = message_recipients.message_id
    AND messages.user_id = auth.uid()
  )
);

-- ========================================
-- Realtime Publication
-- ========================================

-- Enable realtime for messages and recipients
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_recipients;

-- ========================================
-- Updated At Triggers
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_recipients_updated_at
  BEFORE UPDATE ON message_recipients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
