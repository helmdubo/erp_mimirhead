-- Guard kaiten_role_id updates so they only reference existing kaiten.roles rows
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
  SET kaiten_role_id = kr.id
  FROM kaiten.users ku
  LEFT JOIN kaiten.roles kr ON ku.role = kr.id
  WHERE e.kaiten_user_id = ku.id
    AND (e.kaiten_role_id IS DISTINCT FROM kr.id);

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN QUERY SELECT updated_rows;
END;
$$;
