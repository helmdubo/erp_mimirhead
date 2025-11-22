-- Add card_members table for many-to-many relationship
-- between cards and users (participants/members)
--
-- Rationale: Cards can have multiple members (participants)
-- beyond just the owner. This is essential for analytics
-- about who is working on what.

BEGIN;

-- Create card_members table (many-to-many)
CREATE TABLE IF NOT EXISTS kaiten.card_members (
    card_id bigint NOT NULL,
    user_id bigint NOT NULL,
    PRIMARY KEY (card_id, user_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_card_members_card_id
    ON kaiten.card_members(card_id);

CREATE INDEX IF NOT EXISTS idx_card_members_user_id
    ON kaiten.card_members(user_id);

-- Grant permissions (analytics replica - no FK constraints)
GRANT ALL ON kaiten.card_members TO anon, authenticated, service_role;

-- Reload schema cache
NOTIFY pgrst, 'reload config';

COMMIT;
