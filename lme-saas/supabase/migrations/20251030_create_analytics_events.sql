-- Analytics Events Table
-- Stores all user and system events for analytics tracking

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES friends(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Metadata
  user_agent TEXT,
  ip_address INET,
  session_id TEXT,
  page_url TEXT,
  referrer TEXT,

  -- Constraints
  CONSTRAINT valid_event_type CHECK (
    event_type IN (
      -- Message events
      'message_sent',
      'message_delivered',
      'message_read',
      'message_failed',

      -- Campaign events
      'campaign_created',
      'campaign_started',
      'campaign_completed',
      'campaign_paused',
      'campaign_resumed',

      -- Segment events
      'segment_created',
      'segment_updated',
      'segment_deleted',

      -- Friend events
      'friend_added',
      'friend_updated',
      'friend_deleted',
      'friend_tagged',
      'friend_untagged',

      -- Form events
      'form_viewed',
      'form_submitted',
      'form_abandoned',

      -- Reservation events
      'reservation_created',
      'reservation_confirmed',
      'reservation_cancelled',
      'reservation_completed',
      'reservation_no_show',

      -- URL tracking events
      'url_clicked',
      'url_shared',

      -- User events
      'user_login',
      'user_logout',
      'page_viewed',
      'feature_used',

      -- System events
      'api_call',
      'error_occurred',
      'webhook_received'
    )
  )
);

-- Indexes for performance
CREATE INDEX idx_analytics_events_org_id ON analytics_events(organization_id);
CREATE INDEX idx_analytics_events_friend_id ON analytics_events(friend_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_org_type_date ON analytics_events(organization_id, event_type, created_at DESC);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id) WHERE session_id IS NOT NULL;

-- GIN index for JSONB event_data
CREATE INDEX idx_analytics_events_data ON analytics_events USING gin(event_data);

-- Composite index for common queries
CREATE INDEX idx_analytics_events_org_date_type ON analytics_events(organization_id, created_at DESC, event_type);

-- Comments
COMMENT ON TABLE analytics_events IS 'Stores all analytics events for tracking user behavior and system activities';
COMMENT ON COLUMN analytics_events.event_type IS 'Type of event being tracked';
COMMENT ON COLUMN analytics_events.event_data IS 'Additional event metadata in JSON format';
COMMENT ON COLUMN analytics_events.session_id IS 'Browser session identifier for tracking user journeys';
