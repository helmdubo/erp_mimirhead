-- ============================================================================
-- Migration: Add tree_entity_roles and space_members tables
-- Purpose: Track space access roles and member assignments from Kaiten
-- ============================================================================

-- 1. Каталог ролей доступа (tree-entity-roles)
-- Примечание: id — это UUID, не bigint (особенность Kaiten API)
CREATE TABLE IF NOT EXISTS kaiten.tree_entity_roles (
  id uuid PRIMARY KEY,                          -- UUID из Kaiten (не bigint!)
  name text NOT NULL,                           -- admin, writer, reader, "Художник", etc.
  permissions jsonb DEFAULT '{}'::jsonb,        -- Детальные права доступа
  sort_order double precision,                  -- Порядок сортировки
  company_uid uuid,                             -- NULL для стандартных, UUID для кастомных
  is_locked boolean DEFAULT false,              -- Заблокирована ли роль
  new_permissions_default_value boolean,        -- Дефолт для новых permissions
  
  -- Метаданные синхронизации
  kaiten_created_at timestamp with time zone,
  kaiten_updated_at timestamp with time zone,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  payload_hash text,
  raw_payload jsonb DEFAULT '{}'::jsonb
);

-- Индекс для поиска по имени
CREATE INDEX IF NOT EXISTS idx_tree_entity_roles_name 
  ON kaiten.tree_entity_roles(name);

-- Индекс для фильтрации кастомных ролей
CREATE INDEX IF NOT EXISTS idx_tree_entity_roles_company 
  ON kaiten.tree_entity_roles(company_uid) 
  WHERE company_uid IS NOT NULL;

COMMENT ON TABLE kaiten.tree_entity_roles IS 
  'Каталог ролей доступа из Kaiten (tree-entity-roles). Определяет права участников в spaces.';


-- 2. Участники spaces с их ролями (M:N:M связь)
-- Один пользователь может иметь несколько ролей в одном space (напрямую + через группы)
CREATE TABLE IF NOT EXISTS kaiten.space_members (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  space_id bigint NOT NULL,                     -- FK на kaiten.spaces
  user_id bigint NOT NULL,                      -- FK на kaiten.users
  role_id uuid NOT NULL,                        -- FK на kaiten.tree_entity_roles
  
  -- Источник роли
  is_from_group boolean DEFAULT false,          -- true если роль получена через группу
  group_id bigint,                              -- ID группы (если is_from_group = true)
  
  -- Метаданные
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Уникальность: один пользователь + одна роль + один источник в space
  CONSTRAINT space_members_unique UNIQUE (space_id, user_id, role_id, is_from_group)
);

-- Индексы для быстрых запросов
CREATE INDEX IF NOT EXISTS idx_space_members_space 
  ON kaiten.space_members(space_id);

CREATE INDEX IF NOT EXISTS idx_space_members_user 
  ON kaiten.space_members(user_id);

CREATE INDEX IF NOT EXISTS idx_space_members_role 
  ON kaiten.space_members(role_id);

CREATE INDEX IF NOT EXISTS idx_space_members_space_user 
  ON kaiten.space_members(space_id, user_id);

COMMENT ON TABLE kaiten.space_members IS 
  'Участники spaces с их ролями. Один пользователь может иметь несколько ролей в одном space.';


-- 3. VIEW для удобной аналитики
CREATE OR REPLACE VIEW kaiten.v_space_members_detailed AS
SELECT 
  sm.id,
  sm.space_id,
  s.title AS space_title,
  sm.user_id,
  u.full_name AS user_name,
  u.email AS user_email,
  sm.role_id,
  r.name AS role_name,
  r.sort_order AS role_sort_order,
  sm.is_from_group,
  sm.group_id,
  sm.synced_at,
  
  -- Флаг: кастомная роль или стандартная
  CASE WHEN r.company_uid IS NOT NULL THEN true ELSE false END AS is_custom_role
  
FROM kaiten.space_members sm
LEFT JOIN kaiten.spaces s ON s.id = sm.space_id
LEFT JOIN kaiten.users u ON u.id = sm.user_id
LEFT JOIN kaiten.tree_entity_roles r ON r.id = sm.role_id;

COMMENT ON VIEW kaiten.v_space_members_detailed IS 
  'Детальная информация об участниках spaces с названиями и ролями';


-- 4. VIEW: Сводка по пользователям (все их роли во всех spaces)
CREATE OR REPLACE VIEW kaiten.v_user_roles_summary AS
SELECT 
  u.id AS user_id,
  u.full_name,
  u.email,
  COUNT(DISTINCT sm.space_id) AS spaces_count,
  COUNT(DISTINCT sm.role_id) AS unique_roles_count,
  array_agg(DISTINCT r.name ORDER BY r.name) AS role_names,
  array_agg(DISTINCT s.title ORDER BY s.title) AS space_titles
FROM kaiten.users u
LEFT JOIN kaiten.space_members sm ON sm.user_id = u.id
LEFT JOIN kaiten.tree_entity_roles r ON r.id = sm.role_id
LEFT JOIN kaiten.spaces s ON s.id = sm.space_id
GROUP BY u.id, u.full_name, u.email;

COMMENT ON VIEW kaiten.v_user_roles_summary IS 
  'Сводка по пользователям: в каких spaces состоят и с какими ролями';


-- 5. Обновление sync_metadata для новых сущностей
INSERT INTO public.sync_metadata (entity_type, status, total_records)
VALUES 
  ('tree_entity_roles', 'idle', 0),
  ('space_members', 'idle', 0)
ON CONFLICT (entity_type) DO NOTHING;


-- 6. Права доступа
GRANT SELECT, INSERT, UPDATE, DELETE ON kaiten.tree_entity_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON kaiten.space_members TO service_role;
GRANT SELECT ON kaiten.v_space_members_detailed TO service_role, authenticated;
GRANT SELECT ON kaiten.v_user_roles_summary TO service_role, authenticated;
