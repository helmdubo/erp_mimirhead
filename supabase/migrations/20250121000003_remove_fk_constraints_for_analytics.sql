-- Remove foreign key constraints from cards table for analytical replica
--
-- Rationale: This is a data warehouse / analytical mirror, not a production app.
-- We need to preserve card data even if parent entities (columns, boards, users)
-- are deleted in Kaiten or not synced yet.
--
-- Benefits:
-- - Full data preservation (no data loss from FK violations)
-- - Handles archived/deleted parent entities gracefully
-- - Prevents sync failures from timing/ordering issues
-- - JOINs still work (just return NULL for missing parents)

BEGIN;

-- 1. Remove foreign key constraints from cards table
ALTER TABLE kaiten.cards DROP CONSTRAINT IF EXISTS cards_column_id_fkey;
ALTER TABLE kaiten.cards DROP CONSTRAINT IF EXISTS cards_lane_id_fkey;
ALTER TABLE kaiten.cards DROP CONSTRAINT IF EXISTS cards_board_id_fkey;
ALTER TABLE kaiten.cards DROP CONSTRAINT IF EXISTS cards_space_id_fkey;
ALTER TABLE kaiten.cards DROP CONSTRAINT IF EXISTS cards_type_id_fkey;
ALTER TABLE kaiten.cards DROP CONSTRAINT IF EXISTS cards_owner_id_fkey;
ALTER TABLE kaiten.cards DROP CONSTRAINT IF EXISTS cards_creator_id_fkey;

-- 2. Remove foreign key constraint from card_tags (tags can be deleted too)
ALTER TABLE kaiten.card_tags DROP CONSTRAINT IF EXISTS card_tags_tag_id_fkey;

-- Note: We keep card_id foreign key in card_tags because if a card is deleted,
-- we should delete its tag associations (CASCADE is still useful here)

-- 3. Reload schema cache
NOTIFY pgrst, 'reload config';

COMMIT;
