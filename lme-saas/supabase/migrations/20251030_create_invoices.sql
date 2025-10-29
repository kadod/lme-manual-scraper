-- Create invoices table for billing history management
-- Synced with Stripe for payment tracking

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,

  -- Invoice amounts (in JPY cents)
  amount_total INTEGER NOT NULL,
  amount_subtotal INTEGER NOT NULL,
  amount_tax INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'jpy',

  -- Invoice status
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),

  -- Billing period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Payment information
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,

  -- PDF download
  invoice_pdf_url TEXT,

  -- Line items (JSONB array)
  line_items JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE invoices IS 'Invoice and billing history synced with Stripe';
COMMENT ON COLUMN invoices.id IS 'Unique invoice ID';
COMMENT ON COLUMN invoices.organization_id IS 'Organization this invoice belongs to';
COMMENT ON COLUMN invoices.stripe_invoice_id IS 'Stripe invoice ID for synchronization';
COMMENT ON COLUMN invoices.amount_total IS 'Total amount in currency minor units (e.g., JPY cents)';
COMMENT ON COLUMN invoices.amount_subtotal IS 'Subtotal before tax';
COMMENT ON COLUMN invoices.amount_tax IS 'Tax amount';
COMMENT ON COLUMN invoices.currency IS 'Currency code (ISO 4217)';
COMMENT ON COLUMN invoices.status IS 'Invoice status: draft, open, paid, void, uncollectible';
COMMENT ON COLUMN invoices.period_start IS 'Billing period start date';
COMMENT ON COLUMN invoices.period_end IS 'Billing period end date';
COMMENT ON COLUMN invoices.paid IS 'Whether invoice has been paid';
COMMENT ON COLUMN invoices.paid_at IS 'Payment timestamp';
COMMENT ON COLUMN invoices.invoice_pdf_url IS 'URL to download invoice PDF from Stripe';
COMMENT ON COLUMN invoices.line_items IS 'Invoice line items in JSON format';

-- Add example comment for line_items structure
COMMENT ON COLUMN invoices.line_items IS 'Invoice line items structure: [{"description": "Pro Plan", "quantity": 1, "unit_amount": 9800, "amount": 9800}]';

-- Create indexes for performance
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_stripe ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_period ON invoices(period_start, period_end);
CREATE INDEX idx_invoices_paid ON invoices(paid, paid_at DESC);
CREATE INDEX idx_invoices_created ON invoices(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_invoices_org_period ON invoices(organization_id, period_start DESC);
CREATE INDEX idx_invoices_org_status ON invoices(organization_id, status);

-- Add check constraints for amount validation
ALTER TABLE invoices ADD CONSTRAINT invoices_amount_total_check
  CHECK (amount_total >= 0);

ALTER TABLE invoices ADD CONSTRAINT invoices_amount_subtotal_check
  CHECK (amount_subtotal >= 0);

ALTER TABLE invoices ADD CONSTRAINT invoices_amount_tax_check
  CHECK (amount_tax >= 0);

-- Add check constraint for period validation
ALTER TABLE invoices ADD CONSTRAINT invoices_period_check
  CHECK (period_end > period_start);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on changes
CREATE TRIGGER invoices_updated_at_trigger
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_invoices_updated_at();

-- Function to auto-set paid_at when paid status changes
CREATE OR REPLACE FUNCTION set_invoice_paid_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.paid = true AND OLD.paid = false AND NEW.paid_at IS NULL THEN
    NEW.paid_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set paid_at
CREATE TRIGGER invoices_paid_at_trigger
BEFORE UPDATE OF paid ON invoices
FOR EACH ROW
EXECUTE FUNCTION set_invoice_paid_at();

COMMENT ON FUNCTION set_invoice_paid_at IS 'Automatically sets paid_at timestamp when invoice is marked as paid';
