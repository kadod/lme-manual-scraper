-- Create invitations table for staff invitation management
-- Supports email-based invitation workflow with expiration

CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'readonly')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE invitations IS 'Staff invitation management with token-based workflow';
COMMENT ON COLUMN invitations.id IS 'Unique invitation ID';
COMMENT ON COLUMN invitations.organization_id IS 'Organization the invitation is for';
COMMENT ON COLUMN invitations.email IS 'Email address of invitee';
COMMENT ON COLUMN invitations.role IS 'Role to be assigned: admin, member, or readonly';
COMMENT ON COLUMN invitations.token IS 'Unique secure token for invitation URL';
COMMENT ON COLUMN invitations.status IS 'Invitation status: pending, accepted, expired, cancelled';
COMMENT ON COLUMN invitations.expires_at IS 'Expiration timestamp (default: 7 days)';
COMMENT ON COLUMN invitations.invited_by IS 'User who sent the invitation';
COMMENT ON COLUMN invitations.accepted_at IS 'Timestamp when invitation was accepted';
COMMENT ON COLUMN invitations.accepted_by IS 'User who accepted the invitation';

-- Create indexes for performance
CREATE INDEX idx_invitations_org ON invitations(organization_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status) WHERE status = 'pending';
CREATE INDEX idx_invitations_expires ON invitations(expires_at) WHERE status = 'pending';

-- Composite index for common queries
CREATE INDEX idx_invitations_org_status ON invitations(organization_id, status);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on changes
CREATE TRIGGER invitations_updated_at_trigger
BEFORE UPDATE ON invitations
FOR EACH ROW
EXECUTE FUNCTION update_invitations_updated_at();

-- Add unique constraint to prevent duplicate pending invitations
CREATE UNIQUE INDEX idx_invitations_unique_pending
ON invitations(organization_id, email)
WHERE status = 'pending';

COMMENT ON INDEX idx_invitations_unique_pending IS 'Ensures only one pending invitation per email per organization';
