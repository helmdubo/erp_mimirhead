-- Keep ops.employees.kaiten_role_id in sync with kaiten.users.role
CREATE OR REPLACE FUNCTION public.sync_employee_kaiten_roles()
RETURNS TABLE(updated_count integer)
SECURITY DEFINER
SET search_path = public, ops, kaiten
LANGUAGE plpgsql
AS $$
DECLARE
  updated_rows integer;
BEGIN
  UPDATE ops.employees e
  SET kaiten_role_id = ku.role
  FROM kaiten.users ku
  WHERE e.kaiten_user_id = ku.id
    AND (e.kaiten_role_id IS DISTINCT FROM ku.role);

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN QUERY SELECT updated_rows;
END;
$$;
