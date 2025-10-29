-- Create payment_methods table for payment information management
-- Stores tokenized payment method references from Stripe

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account')),
  is_default BOOLEAN DEFAULT false,

  -- Card information (from Stripe)
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,

  -- Bank account information
  bank_name TEXT,
  bank_last4 TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE payment_methods IS 'Organization payment methods with Stripe tokenization';
COMMENT ON COLUMN payment_methods.id IS 'Unique payment method ID';
COMMENT ON COLUMN payment_methods.organization_id IS 'Organization this payment method belongs to';
COMMENT ON COLUMN payment_methods.stripe_payment_method_id IS 'Stripe payment method token (never stores actual card numbers)';
COMMENT ON COLUMN payment_methods.type IS 'Payment type: card or bank_account';
COMMENT ON COLUMN payment_methods.is_default IS 'Whether this is the default payment method';
COMMENT ON COLUMN payment_methods.card_brand IS 'Card brand: visa, mastercard, amex, etc.';
COMMENT ON COLUMN payment_methods.card_last4 IS 'Last 4 digits of card number';
COMMENT ON COLUMN payment_methods.card_exp_month IS 'Card expiration month (1-12)';
COMMENT ON COLUMN payment_methods.card_exp_year IS 'Card expiration year (4 digits)';

-- Create indexes for performance
CREATE INDEX idx_payment_methods_org ON payment_methods(organization_id);
CREATE INDEX idx_payment_methods_stripe ON payment_methods(stripe_payment_method_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(organization_id, is_default) WHERE is_default = true;

-- Add check constraints for card expiration validation
ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_card_exp_month_check
  CHECK (card_exp_month IS NULL OR (card_exp_month >= 1 AND card_exp_month <= 12));

ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_card_exp_year_check
  CHECK (card_exp_year IS NULL OR (card_exp_year >= 2024 AND card_exp_year <= 2099));

ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_card_last4_check
  CHECK (card_last4 IS NULL OR length(card_last4) = 4);

ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_bank_last4_check
  CHECK (bank_last4 IS NULL OR length(bank_last4) = 4);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on changes
CREATE TRIGGER payment_methods_updated_at_trigger
BEFORE UPDATE ON payment_methods
FOR EACH ROW
EXECUTE FUNCTION update_payment_methods_updated_at();

-- Function to ensure only one default payment method per organization
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    -- Unset all other default payment methods for this organization
    UPDATE payment_methods
    SET is_default = false
    WHERE organization_id = NEW.organization_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure only one default payment method
CREATE TRIGGER payment_methods_single_default_trigger
BEFORE INSERT OR UPDATE OF is_default ON payment_methods
FOR EACH ROW
WHEN (NEW.is_default = true)
EXECUTE FUNCTION ensure_single_default_payment_method();

COMMENT ON FUNCTION ensure_single_default_payment_method IS 'Ensures only one payment method is marked as default per organization';
