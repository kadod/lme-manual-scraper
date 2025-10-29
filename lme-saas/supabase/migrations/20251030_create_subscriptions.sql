-- Create subscriptions table for plan and billing management
-- Integrates with Stripe for payment processing

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled', 'paused')),

  -- Stripe integration
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Plan details
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- Usage limits per plan
  limits JSONB DEFAULT '{
    "friends": 1000,
    "messages_per_month": 5000,
    "staff_accounts": 3,
    "forms": 10,
    "rich_menus": 5,
    "api_calls_per_day": 1000
  }'::jsonb,

  -- Current usage counters
  usage JSONB DEFAULT '{
    "friends": 0,
    "messages_this_month": 0,
    "staff_accounts": 1,
    "forms": 0,
    "rich_menus": 0,
    "api_calls_today": 0
  }'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE subscriptions IS 'Organization subscription and billing management with Stripe integration';
COMMENT ON COLUMN subscriptions.id IS 'Unique subscription ID';
COMMENT ON COLUMN subscriptions.organization_id IS 'One subscription per organization';
COMMENT ON COLUMN subscriptions.plan IS 'Subscription plan: free, pro, or enterprise';
COMMENT ON COLUMN subscriptions.status IS 'Subscription status: active, trialing, past_due, cancelled, paused';
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN subscriptions.stripe_price_id IS 'Stripe price ID for current plan';
COMMENT ON COLUMN subscriptions.limits IS 'Resource limits based on plan (JSON)';
COMMENT ON COLUMN subscriptions.usage IS 'Current usage counters (JSON)';

-- Create indexes for performance
CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end) WHERE status = 'active';

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on changes
CREATE TRIGGER subscriptions_updated_at_trigger
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscriptions_updated_at();

-- Function to check if organization is within usage limits
CREATE OR REPLACE FUNCTION is_within_usage_limit(
  p_organization_id UUID,
  p_resource TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_limit INTEGER;
  v_usage INTEGER;
BEGIN
  SELECT
    (limits->>p_resource)::INTEGER,
    (usage->>p_resource)::INTEGER
  INTO v_limit, v_usage
  FROM subscriptions
  WHERE organization_id = p_organization_id;

  IF v_limit IS NULL OR v_usage IS NULL THEN
    RETURN false;
  END IF;

  RETURN v_usage < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_within_usage_limit IS 'Checks if organization is within usage limits for a specific resource';
