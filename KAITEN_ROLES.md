# Kaiten Roles System

## Обзор

Kaiten использует две независимые системы ролей:

1. **Time Log Roles** — для учёта времени (таймшиты)
2. **Tree Entity Roles** — для управления доступом

## 1. Time Log Roles

**API endpoint:** `GET /user-roles`

**Таблица:** `kaiten.roles`

Эти роли используются при записи времени на карточку. Сотрудник выбирает роль из списка при логировании.

```json
{
  "id": 12345,
  "name": "3D Artist",
  "company_id": 789
}
```

**Применение:** Когда сотрудник записывает время, он указывает в какой роли работал. Это используется для аналитики и биллинга.

## 2. Tree Entity Roles (Роли доступа)

**API endpoint:** `GET /tree-entity-roles`

**Таблица:** `kaiten.tree_entity_roles`

Определяют что пользователь может делать в space/board/card.

### Структура

```typescript
interface TreeEntityRole {
  id: string;           // UUID! (не число)
  name: string;         // "admin", "writer", "Художник"
  permissions: object;  // Детальные права
  sort_order: number;
  company_uid: string | null;  // null = стандартная, uuid = кастомная
  is_locked: boolean;
  new_permissions_default_value: boolean;
}
```

### Стандартные роли (company_uid = null)

| Роль | Описание |
|------|----------|
| `admin` | Полный доступ: CRUD для всего |
| `writer` | Редактирование: create/update cards, columns |
| `reader` | Только просмотр |
| `commenter` | Просмотр + комментирование |
| `card-creator` | Создание карточек |

### Кастомные роли (company_uid = uuid)

Создаются в настройках компании Kaiten. Пример:

```json
{
  "id": "32b49f1c-efa8-4c9c-a310-96d20e7b0c3e",
  "name": "Художник",
  "company_uid": "7740bbc6-9cd1-4294-a826-1b5dfa3a2d22",
  "permissions": {
    "space": {
      "card": { "read": true, "create": true, "update": true, "delete": false },
      "board": { "read": true, "create": true, "delete": false }
    }
  }
}
```

### Структура permissions

```json
{
  "root": {
    "move": false,
    "share": true,
    "create": false,
    "import": true
  },
  "space": {
    "read": true,
    "create": false,
    "delete": false,
    "update": false,
    "card": {
      "read": true,
      "create": true,
      "update": true,
      "delete": false,
      "move": true,
      "comment": true,
      "properties": true
    },
    "board": {
      "read": true,
      "create": true,
      "update": true,
      "delete": false
    },
    "access_control": false
  },
  "document": {
    "read": true,
    "create": false,
    "update": false,
    "delete": false
  }
}
```

## 3. Space Members

**API endpoint:** `GET /spaces/{id}/users`

**Таблица:** `kaiten.space_members`

Связывает пользователей со spaces через tree_entity_roles.

### Query параметры

| Параметр | Описание |
|----------|----------|
| `include_inherited_access` | Включить пользователей с унаследованным доступом |
| `inactive` | Включить **только** деактивированных пользователей |

**Важно:** Для получения полного списка нужно ДВА запроса:
```
GET /spaces/{id}/users?include_inherited_access=true          — активные
GET /spaces/{id}/users?include_inherited_access=true&inactive=true  — неактивные
```

### Ответ API (активный пользователь)

```json
{
  "id": 773148,
  "full_name": "d.shcherikanov",
  "email": "d.shcherikanov@company.com",
  "role_ids": ["32b49f1c-...", "a431ed00-..."],
  "own_role_ids": ["32b49f1c-..."],
  "own_groups_role_ids": ["32b49f1c-..."],
  "groups_role_ids": ["32b49f1c-..."],
  "groups": [
    {
      "id": 293118,
      "name": "Художники"
    }
  ]
}
```

### Ответ API (деактивированный пользователь)

```json
{
  "id": 774286,
  "full_name": "Андрей Горюнов",
  "email": "gorunovandrey123@gmail.com"
  // НЕТ role_ids, own_role_ids, groups!
}
```

**Важно:** Деактивированные пользователи НЕ имеют полей с ролями. Они просто числятся в space для истории.

### Поля role_ids

| Поле | Описание |
|------|----------|
| `role_ids` | Все роли пользователя (итоговые) |
| `own_role_ids` | Роли назначенные напрямую |
| `own_groups_role_ids` | Роли через группы (только свои) |
| `groups_role_ids` | Все роли всех групп |

### Логика обработки

```typescript
// 1. Собственные роли
for (const roleId of user.own_role_ids) {
  insert({ space_id, user_id, role_id: roleId, is_from_group: false, is_inactive: false });
}

// 2. Роли через группы
for (const roleId of user.own_groups_role_ids) {
  insert({ space_id, user_id, role_id: roleId, is_from_group: true, is_inactive: false });
}

// 3. Fallback если own_role_ids пустой
if (!user.own_role_ids?.length && user.role_ids?.length) {
  for (const roleId of user.role_ids) {
    insert({ space_id, user_id, role_id: roleId, is_from_group: false, is_inactive: false });
  }
}

// 4. ДЕАКТИВИРОВАННЫЕ: если нет НИКАКИХ ролей
if (userHasNoRoles) {
  insert({ space_id, user_id, role_id: null, is_from_group: false, is_inactive: true });
}
```

## 4. Схема базы данных

### tree_entity_roles

```sql
CREATE TABLE kaiten.tree_entity_roles (
  id uuid PRIMARY KEY,        -- UUID из Kaiten
  name text NOT NULL,
  permissions jsonb,
  sort_order numeric,
  company_uid uuid,           -- null = стандартная роль
  is_locked boolean DEFAULT false,
  new_permissions_default_value boolean,
  kaiten_created_at timestamptz,
  kaiten_updated_at timestamptz,
  synced_at timestamptz,
  payload_hash text,
  raw_payload jsonb
);
```

### space_members

```sql
CREATE TABLE kaiten.space_members (
  id bigserial PRIMARY KEY,
  space_id bigint NOT NULL,
  user_id bigint NOT NULL,
  role_id uuid,              -- NULLABLE! NULL для деактивированных
  is_from_group boolean DEFAULT false,
  group_id bigint,           -- ID группы если роль через группу
  is_inactive boolean DEFAULT false,  -- true для деактивированных
  synced_at timestamptz,
  
  -- Unique с обработкой NULL через COALESCE
  UNIQUE INDEX (space_id, user_id, COALESCE(role_id, '00000000-0000-0000-0000-000000000000'), is_from_group)
);
```

**Важно:** `role_id` может быть NULL для деактивированных пользователей!

### Views

```sql
-- Детальный список участников (с поддержкой неактивных)
CREATE VIEW kaiten.v_space_members_detailed AS
SELECT 
  sm.space_id,
  s.title as space_title,
  sm.user_id,
  u.full_name as user_name,
  u.email as user_email,
  sm.role_id,
  COALESCE(r.name, 'Неактивен') as role_name,  -- "Неактивен" для NULL
  sm.is_from_group,
  sm.group_id,
  sm.is_inactive,
  CASE 
    WHEN r.company_uid IS NOT NULL THEN true 
    WHEN sm.role_id IS NULL THEN false
    ELSE false 
  END as is_custom_role
FROM kaiten.space_members sm
LEFT JOIN kaiten.spaces s ON s.id = sm.space_id
LEFT JOIN kaiten.users u ON u.id = sm.user_id
LEFT JOIN kaiten.tree_entity_roles r ON r.id = sm.role_id;

-- Сводка по пользователям
CREATE VIEW kaiten.v_user_roles_summary AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.email,
  COUNT(DISTINCT sm.space_id) as spaces_count,
  COUNT(DISTINCT sm.role_id) FILTER (WHERE sm.role_id IS NOT NULL) as unique_roles_count,
  ARRAY_AGG(DISTINCT COALESCE(r.name, 'Неактивен')) FILTER (WHERE sm.id IS NOT NULL) as role_names,
  ARRAY_AGG(DISTINCT s.title) FILTER (WHERE sm.id IS NOT NULL) as space_titles,
  BOOL_OR(COALESCE(sm.is_inactive, false)) as has_inactive_membership
FROM kaiten.users u
LEFT JOIN kaiten.space_members sm ON sm.user_id = u.id
LEFT JOIN kaiten.tree_entity_roles r ON r.id = sm.role_id
LEFT JOIN kaiten.spaces s ON s.id = sm.space_id
GROUP BY u.id, u.full_name, u.email;
```

## 5. Синхронизация

### Порядок

1. `tree_entity_roles` — каталог ролей (1 запрос)
2. `space_members` — участники (запрос на каждый space)

### Стратегия

- **tree_entity_roles:** upsert по id
- **space_members:** full replace (DELETE + INSERT)

Full replace используется потому что:
- Нет `updated_at` в API ответе
- Нужно удалять пользователей убранных из space
- Данных немного (десятки-сотни записей)

### Код

```typescript
// В sync-orchestrator.ts
async syncSpaceMembers() {
  const allSpaceData = await kaitenClient.getAllSpaceMembers();
  
  // Удаляем старые записи
  await supabase.schema('kaiten').from('space_members').delete().gte('id', 0);
  
  // Вставляем новые батчами по 500
  for (const batch of chunks(memberRows, 500)) {
    await supabase.schema('kaiten').from('space_members').insert(batch);
  }
}
```

## 6. Использование в UI

### Страница сотрудников

```
/admin/employees
```

Функции:
- Переключение между сводкой и детальным списком
- Фильтрация по spaces (чекбоксы)
- Фильтрация по ролям (чекбоксы)
- Фильтр "только кастомные роли"
- Фильтр "только роли через группы"
- **Фильтр "👻 только неактивные"**
- Поиск по имени/email
- Настройка видимых колонок

### Отображение неактивных

- Иконка 👻 перед именем
- Роль показывается как "👻 Неактивен"
- Строка полупрозрачная (opacity)

### Пример запросов

```sql
-- Кто имеет кастомные роли?
SELECT * FROM kaiten.v_space_members_detailed 
WHERE is_custom_role = true;

-- Деактивированные пользователи по проектам
SELECT user_name, space_title 
FROM kaiten.v_space_members_detailed 
WHERE is_inactive = true
ORDER BY space_title;

-- Сколько ролей у каждого пользователя?
SELECT full_name, unique_roles_count, role_names 
FROM kaiten.v_user_roles_summary 
ORDER BY unique_roles_count DESC;

-- Кто в Production space (включая бывших)?
SELECT user_name, role_name, is_inactive 
FROM kaiten.v_space_members_detailed 
WHERE space_title = 'Production';

-- История участников проекта
SELECT 
  space_title,
  COUNT(*) FILTER (WHERE NOT is_inactive) as active_members,
  COUNT(*) FILTER (WHERE is_inactive) as former_members
FROM kaiten.v_space_members_detailed
GROUP BY space_title;
```

---

**Last Updated:** 2025-12-02
