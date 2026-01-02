-- Adds email verification support
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
    ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN users.email_verified IS 'Has the user verified their email';
COMMENT ON COLUMN users.email_verification_token IS 'One-time token used for email verification';
COMMENT ON COLUMN users.email_verification_sent_at IS 'Timestamp when verification email was sent';
