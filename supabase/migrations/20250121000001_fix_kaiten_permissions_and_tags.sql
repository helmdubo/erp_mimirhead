-- Fix permissions and add missing columns to tags table
-- This migration addresses three issues:
-- 1. Grant proper permissions to service_role on kaiten schema
-- 2. Add missing kaiten_created_at and kaiten_updated_at columns to tags
-- 3. Add missing payload_hash column to property_definitions

BEGIN;

-- 1. Grant permissions on kaiten schema to all roles
GRANT USAGE ON SCHEMA kaiten TO anon, authenticated, service_role;

-- Grant permissions on all existing tables
GRANT ALL ON ALL TABLES IN SCHEMA kaiten TO anon, authenticated, service_role;

-- Grant permissions on all sequences (for auto-increment columns if any)
GRANT ALL ON ALL SEQUENCES IN SCHEMA kaiten TO anon, authenticated, service_role;

-- Grant permissions on all functions (for any stored procedures)
GRANT ALL ON ALL FUNCTIONS IN SCHEMA kaiten TO anon, authenticated, service_role;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA kaiten
    GRANT ALL ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA kaiten
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA kaiten
    GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;


-- 2. Add missing columns to tags table
ALTER TABLE kaiten.tags
    ADD COLUMN IF NOT EXISTS kaiten_created_at timestamptz,
    ADD COLUMN IF NOT EXISTS kaiten_updated_at timestamptz,
    ADD COLUMN IF NOT EXISTS payload_hash text;

-- 3. Add missing columns to property_definitions
ALTER TABLE kaiten.property_definitions
    ADD COLUMN IF NOT EXISTS kaiten_updated_at timestamptz,
    ADD COLUMN IF NOT EXISTS payload_hash text;

-- 4. Add missing payload_hash column to card_types
ALTER TABLE kaiten.card_types
    ADD COLUMN IF NOT EXISTS payload_hash text;

-- 5. Reload schema cache so PostgREST sees the new columns
NOTIFY pgrst, 'reload config';

COMMIT;
