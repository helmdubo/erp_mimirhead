# ✅ Supabase + Kaiten Integration - Setup Complete

## 🎯 Current Status (2025-12-02)

**✅ FULL INTEGRATION WORKING!**

### What's Working:
- ✅ Supabase connection configured
- ✅ All tables created in `kaiten` schema
- ✅ Kaiten API client with correct endpoints
- ✅ Full data synchronization (cards, users, boards, etc.)
- ✅ Time logs sync (parallel by months)
- ✅ Tree entity roles sync (access permissions)
- ✅ Space members sync (user-space-role relationships)
- ✅ **Inactive/deactivated users** synced with `role_id=null`
- ✅ Employees UI page with filters (including "👻 Только неактивные")

---

## 📊 Database Tables

### Core Tables (kaiten schema)

| Table | Records | Description |
|-------|---------|-------------|
| `spaces` | ~2 | Workspaces |
| `boards` | ~7 | Boards |
| `columns` | ~20 | Columns |
| `lanes` | ~16 | Swim-lanes |
| `users` | ~17 | Users |
| `cards` | ~1000 | Tasks/cards |
| `time_logs` | varies | Time entries |
| `roles` | ~5 | Time-log roles |
| `tree_entity_roles` | ~8 | Access roles (UUID!) |
| `space_members` | varies | User-space-role links (incl. inactive!) |

### Key Columns in space_members

| Column | Type | Description |
|--------|------|-------------|
| `space_id` | bigint | FK to spaces |
| `user_id` | bigint | FK to users |
| `role_id` | uuid **NULLABLE** | FK to tree_entity_roles (NULL for inactive) |
| `is_inactive` | boolean | true for deactivated users |
| `is_from_group` | boolean | true if role via group |

### Views

| View | Description |
|------|-------------|
| `v_space_members_detailed` | Expanded member list (shows "Неактивен" for inactive) |
| `v_user_roles_summary` | Aggregated user roles |

---

## 🌐 UI Pages

### Home (`/`)
Navigation dashboard with quick access to all sections.

### Sync Admin (`/admin/sync`)
- Full sync button
- Incremental sync button
- **Roles & members sync button** ← NEW
- Time logs sync (date range or full year)
- Sync history table
- Status per entity type

### Employees (`/admin/employees`) ← NEW
- Stats cards (users, spaces, roles, assignments)
- Roles catalog display
- Two view modes: Summary / Detailed
- Filters:
  - By spaces (checkbox pills)
  - By roles (checkbox pills)
  - Custom roles only
  - Group roles only
  - Search by name/email
- Column visibility toggles

---

## 🔄 Sync Architecture

### Entity Dependencies
```
spaces ─────────────────────────────────┐
users ──────────────────────────────────┤
tree_entity_roles ──────────────────────┤
                                        ▼
boards ─────► columns ────► cards ────► time_logs
       └────► lanes ───────┘
                                        
spaces + users + tree_entity_roles ────► space_members
```

### Sync Strategies

| Entity | Strategy | Reason |
|--------|----------|--------|
| cards | Upsert by ID | Has `updated_at` |
| tree_entity_roles | Upsert by UUID | Has `updated_at` |
| space_members | Full replace | No `updated_at`, need to remove deleted |
| time_logs | Upsert by ID | Date range filtering |

---

## 🎭 Roles System

### Two Types of Roles

**1. Time Log Roles** (`/user-roles` API)
- Table: `kaiten.roles`
- ID: `bigint`
- Used for: Selecting role when logging time
- Example: "3D Artist", "Developer"

**2. Tree Entity Roles** (`/tree-entity-roles` API)
- Table: `kaiten.tree_entity_roles`
- ID: `uuid` ← IMPORTANT!
- Used for: Access control to spaces/boards
- Standard: admin, writer, reader
- Custom: Company-specific (have `company_uid`)

### Inactive/Deactivated Users

Users who were deactivated in the company but historically worked on spaces:
- **API:** `GET /spaces/{id}/users?include_inherited_access=true&inactive=true`
- **No role_ids** in API response — only basic user info
- **Stored with:** `role_id = NULL`, `is_inactive = true`
- **Displayed as:** "👻 Неактивен" in UI
- **Use case:** Historical reports ("how many people worked on project")

### Space Members

Links users to spaces via roles:
```sql
space_members (
  space_id   → spaces.id
  user_id    → users.id
  role_id    → tree_entity_roles.id (UUID, NULLABLE!)
  is_inactive    -- true for deactivated users
  is_from_group  -- true if role via group
  group_id       -- which group (if applicable)
)
```

---

## 📋 Migration History

| Migration | Description |
|-----------|-------------|
| `20250101000000_init_kaiten.sql` | Base schema + tables |
| `20250121000001_fix_kaiten_permissions_and_tags.sql` | Permissions fix |
| `20250121000002_fix_sort_order_types.sql` | Double precision |
| `20250121000003_remove_fk_constraints_for_analytics.sql` | Remove FKs |
| `20250122000000_add_card_members.sql` | Card participants |
| `20250125000003_remove_timelogs_fks.sql` | Time logs FKs |
| `20250602000000_add_tree_entity_roles_and_space_members.sql` | Roles system |
| **`20250602000001_allow_null_role_for_inactive_users.sql`** | **Inactive users** |

### Critical: Inactive Users Migration

Migration `20250602000001` is **required** for inactive users:
- Makes `role_id` nullable
- Adds `is_inactive` boolean column  
- Updates unique constraint with COALESCE for NULL handling
- Recreates VIEWs with "Неактивен" for null roles

**Diagnostic:** `supabase/diagnostic_space_members.sql`

---

## 🚀 How to Run

### First Time Setup
```bash
# 1. Apply migrations
npx supabase db push

# 2. Open admin panel
# https://your-site.vercel.app/admin/sync

# 3. Click "🔄 Полная синхронизация"
# 4. Click "👥 Роли доступа и участники"
# 5. Load time logs as needed
```

### Regular Updates
- Use "⚡ Обновить изменения" for incremental sync
- Roles sync is separate (doesn't change often)

---

## ⚠️ Known Limitations

1. **Vercel Hobby timeout:** 60 seconds max
   - Solution: Split syncs, parallel time logs

2. **space_members full replace:** Deletes and re-inserts all
   - OK for small datasets (<1000 records)

3. **No real-time updates:** Manual sync required
   - Webhook handler exists but needs HMAC validation

---

## 📁 Key Files

### Sync Logic
- `lib/kaiten/client.ts` — API client
- `lib/kaiten/sync-orchestrator.ts` — ETL orchestrator
- `lib/kaiten/types.ts` — TypeScript types
- `app/actions/sync-actions.ts` — Server actions

### UI Components
- `app/page.tsx` — Home navigation
- `app/admin/sync/sync-controls.tsx` — Sync buttons
- `app/admin/employees/employees-table.tsx` — Employees table

### Documentation
- `README.md` — Project overview
- `QUICK_START.md` — Getting started
- `docs/KAITEN_ROLES.md` — Roles system details
- `docs/SYNC_SYSTEM.md` — Sync architecture

---

## 🔐 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Kaiten
KAITEN_API_URL=https://company.kaiten.ru
KAITEN_API_TOKEN=xxx
```

---

**Last Updated:** 2025-12-02
**Status:** ✅ Production Ready

### All Features Working:
- ✅ Cards, boards, users, time logs sync
- ✅ Tree entity roles (access control)
- ✅ Active space members with roles
- ✅ **Inactive/deactivated users** linked to spaces
- ✅ UI with filters including "👻 Только неактивные"