-- Fix list_tables function with proper permissions and simpler approach

-- Drop existing function if any
DROP FUNCTION IF EXISTS public.list_tables(text[]);

-- Create a simpler version that doesn't take parameters
CREATE OR REPLACE FUNCTION public.list_tables()
RETURNS TABLE (
  schemaname text,
  tablename text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT
    t.table_schema::text AS schemaname,
    t.table_name::text AS tablename
  FROM information_schema.tables t
  WHERE t.table_schema IN ('public', 'kaiten')
    AND t.table_type = 'BASE TABLE'
  ORDER BY t.table_schema, t.table_name;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.list_tables() TO anon;
GRANT EXECUTE ON FUNCTION public.list_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_tables() TO service_role;

-- Add comment
COMMENT ON FUNCTION public.list_tables() IS 'Returns list of tables from public and kaiten schemas';
