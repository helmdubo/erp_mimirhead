-- Backfill missing Kaiten roles from kaiten.users and then sync employee role references safely
CREATE OR REPLACE FUNCTION public.sync_employee_kaiten_roles()
RETURNS TABLE(updated_count integer)
SECURITY DEFINER
SET search_path = public, ops, kaiten
LANGUAGE plpgsql
AS $$
DECLARE
  updated_rows integer;
BEGIN
  -- Ensure every referenced kaiten.users.role has a corresponding kaiten.roles row
  INSERT INTO kaiten.roles (id, name, company_id, created_at, updated_at, synced_at, raw_payload)
  SELECT DISTINCT ku.role,
         CONCAT('Unknown Kaiten Role #', ku.role),
         NULL,
         now(),
         now(),
         now(),
         jsonb_build_object('source', 'kaiten.users', 'note', 'Backfilled to satisfy FK for employees')
  FROM kaiten.users ku
  WHERE ku.role IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM kaiten.roles r WHERE r.id = ku.role
    );

  -- Update employee references only when the Kaiten role exists (or null it when absent)
  UPDATE ops.employees e
  SET kaiten_role_id = kr.id
  FROM kaiten.users ku
  LEFT JOIN kaiten.roles kr ON ku.role = kr.id
  WHERE e.kaiten_user_id = ku.id
    AND (e.kaiten_role_id IS DISTINCT FROM kr.id);

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN QUERY SELECT updated_rows;
END;
$$;
