-- Fix sort_order types in columns and lanes tables
-- Kaiten API returns sort_order as floating point numbers for precise positioning
-- Change from integer to double precision to match the API data

BEGIN;

-- 1. Change sort_order type in columns table
ALTER TABLE kaiten.columns
    ALTER COLUMN sort_order TYPE double precision;

-- 2. Change sort_order type in lanes table
ALTER TABLE kaiten.lanes
    ALTER COLUMN sort_order TYPE double precision;

-- 3. Reload schema cache so PostgREST sees the type changes
NOTIFY pgrst, 'reload config';

COMMIT;
