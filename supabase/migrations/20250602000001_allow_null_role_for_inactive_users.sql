-- Migration: Allow NULL role_id for inactive/deactivated users
-- Date: 2025-12-02
-- 
-- Деактивированные пользователи остаются привязаны к space,
-- но у них нет роли (role_id = NULL). Это нужно для истории
-- и отчётности о том, сколько участников прошло через проект.

-- 1. Разрешаем NULL для role_id
ALTER TABLE kaiten.space_members 
  ALTER COLUMN role_id DROP NOT NULL;

-- 2. Добавляем колонку для отметки неактивных пользователей
ALTER TABLE kaiten.space_members 
  ADD COLUMN IF NOT EXISTS is_inactive boolean DEFAULT false;

-- 3. Обновляем уникальный constraint (теперь role_id может быть null)
-- Сначала удаляем старый
ALTER TABLE kaiten.space_members 
  DROP CONSTRAINT IF EXISTS space_members_unique;

-- Создаём новый с COALESCE для обработки NULL
-- Для inactive users: один пользователь = одна запись в space (без роли)
CREATE UNIQUE INDEX IF NOT EXISTS space_members_unique_idx 
  ON kaiten.space_members (space_id, user_id, COALESCE(role_id, '00000000-0000-0000-0000-000000000000'::uuid), is_from_group);

-- 4. Пересоздаём VIEW v_space_members_detailed
DROP VIEW IF EXISTS kaiten.v_space_members_detailed;

CREATE VIEW kaiten.v_space_members_detailed AS
SELECT 
  sm.id,
  sm.space_id,
  s.title AS space_title,
  sm.user_id,
  u.full_name AS user_name,
  u.email AS user_email,
  sm.role_id,
  COALESCE(r.name, 'Неактивен') AS role_name,
  sm.is_from_group,
  sm.group_id,
  sm.is_inactive,
  CASE 
    WHEN r.company_uid IS NOT NULL THEN true 
    WHEN sm.role_id IS NULL THEN false  -- inactive users не имеют кастомной роли
    ELSE false 
  END AS is_custom_role,
  sm.synced_at
FROM kaiten.space_members sm
LEFT JOIN kaiten.spaces s ON s.id = sm.space_id
LEFT JOIN kaiten.users u ON u.id = sm.user_id
LEFT JOIN kaiten.tree_entity_roles r ON r.id = sm.role_id;

-- 5. Пересоздаём VIEW v_user_roles_summary
DROP VIEW IF EXISTS kaiten.v_user_roles_summary;

CREATE VIEW kaiten.v_user_roles_summary AS
SELECT 
  u.id AS user_id,
  u.full_name,
  u.email,
  COUNT(DISTINCT sm.space_id) AS spaces_count,
  COUNT(DISTINCT sm.role_id) FILTER (WHERE sm.role_id IS NOT NULL) AS unique_roles_count,
  ARRAY_AGG(DISTINCT COALESCE(r.name, 'Неактивен')) AS role_names,
  ARRAY_AGG(DISTINCT s.title) AS space_titles,
  BOOL_OR(sm.is_inactive) AS has_inactive_membership
FROM kaiten.users u
LEFT JOIN kaiten.space_members sm ON sm.user_id = u.id
LEFT JOIN kaiten.tree_entity_roles r ON r.id = sm.role_id
LEFT JOIN kaiten.spaces s ON s.id = sm.space_id
GROUP BY u.id, u.full_name, u.email;

-- Комментарии
COMMENT ON COLUMN kaiten.space_members.role_id IS 'UUID роли доступа. NULL для деактивированных пользователей.';
COMMENT ON COLUMN kaiten.space_members.is_inactive IS 'true если пользователь деактивирован в компании, но был участником space.';
