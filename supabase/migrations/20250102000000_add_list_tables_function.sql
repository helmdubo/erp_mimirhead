-- Add RPC function to list tables in specific schemas
-- This allows the frontend to check which tables exist

CREATE OR REPLACE FUNCTION public.list_tables(schema_names text[] DEFAULT ARRAY['public', 'kaiten'])
RETURNS TABLE (
  schemaname text,
  tablename text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.table_schema::text,
    t.table_name::text
  FROM information_schema.tables t
  WHERE t.table_schema = ANY(schema_names)
    AND t.table_type = 'BASE TABLE'
  ORDER BY t.table_schema, t.table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow anonymous users to call this function
GRANT EXECUTE ON FUNCTION public.list_tables TO anon, authenticated;
