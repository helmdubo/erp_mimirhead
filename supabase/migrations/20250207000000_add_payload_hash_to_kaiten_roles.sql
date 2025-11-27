-- Add payload_hash column to kaiten.roles to align with sync payloads
ALTER TABLE kaiten.roles
  ADD COLUMN IF NOT EXISTS payload_hash text;
