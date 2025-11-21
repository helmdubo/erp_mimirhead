# 🚀 Quick Start Guide

## Current Status
✅ **Kaiten sync is WORKING!** All 999 cards synced successfully.

⚠️ **Known Issue:** Some columns in `cards` table have NULL values (investigate in next session)

---

## Access Points

### Admin Sync Page
```
https://your-domain.vercel.app/admin/sync
```

### Supabase Dashboard
```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID
```

---

## Quick Commands

### Run Sync (Via UI)
1. Go to `/admin/sync`
2. Click "🔄 Полная синхронизация"
3. Wait 60-90 seconds for auto-refresh

### Check Sync Logs (SQL)
```sql
-- Recent syncs
SELECT entity_type, status, records_processed, duration_ms, started_at
FROM kaiten.sync_logs
ORDER BY started_at DESC
LIMIT 10;

-- Check for NULLs in cards
SELECT
  COUNT(*) as total,
  COUNT(type_id) as has_type,
  COUNT(owner_id) as has_owner,
  COUNT(column_id) as has_column
FROM kaiten.cards;
```

### Apply Migrations
```bash
npx supabase db push
```

---

## Architecture Overview

```
Kaiten API → Client (lib/kaiten/client.ts)
    ↓
Sync Orchestrator (lib/kaiten/sync-orchestrator.ts)
    ↓
Supabase (kaiten schema)
    ↓
Admin UI (/admin/sync)
```

---

## Key Numbers

- **Cards:** 999 synced ✅
- **Sync Time:** ~37 seconds
- **Timeout Limit:** 60 seconds
- **Batch Size:** 100 records
- **Pagination:** 100 items per page

---

## Environment Setup

**Vercel Environment Variables:**
- `KAITEN_API_URL` ✅
- `KAITEN_API_TOKEN` ✅
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅

**Local Development:**
```bash
# Copy template
cp .env.example .env.local

# Add your secrets to .env.local
# NEVER commit .env.local to git!
```

---

## Next Session: Fix NULL Values

### Steps to Investigate:

1. **Check which columns have NULLs:**
```sql
SELECT
  id,
  title,
  type_id,
  owner_id,
  column_id,
  lane_id,
  raw_payload->>'type_id' as api_type_id
FROM kaiten.cards
WHERE type_id IS NULL OR owner_id IS NULL
LIMIT 10;
```

2. **Review field mapping:**
   - File: `lib/kaiten/sync-orchestrator.ts`
   - Function: `transformToDbFormat` (case 'cards')
   - Check if field names match Kaiten API response

3. **Check raw API response:**
```sql
SELECT raw_payload FROM kaiten.cards LIMIT 1;
```

4. **Compare with Kaiten API docs:**
   - Verify field names in API response
   - Update mapping if needed

5. **Test fix:**
   - Update `transformToDbFormat`
   - Run sync for cards only
   - Verify NULLs are filled

---

## Troubleshooting Quick Fixes

### "Permission denied for schema kaiten"
```sql
GRANT ALL ON ALL TABLES IN SCHEMA kaiten TO service_role;
NOTIFY pgrst, 'reload config';
```

### "Column not found"
```sql
-- Reload PostgREST cache
NOTIFY pgrst, 'reload config';
```

### Sync timeout but data appears
- This is expected! Fire-and-forget pattern
- Sync continues in background
- Just refresh the page after 60s

### Wrong number of records
- Check sync_logs for errors
- Re-run sync
- Check Vercel function logs

---

## Useful Queries

### Count Records in Each Table
```sql
SELECT
  'spaces' as table_name, COUNT(*) FROM kaiten.spaces
UNION ALL
SELECT 'boards', COUNT(*) FROM kaiten.boards
UNION ALL
SELECT 'columns', COUNT(*) FROM kaiten.columns
UNION ALL
SELECT 'lanes', COUNT(*) FROM kaiten.lanes
UNION ALL
SELECT 'users', COUNT(*) FROM kaiten.users
UNION ALL
SELECT 'card_types', COUNT(*) FROM kaiten.card_types
UNION ALL
SELECT 'tags', COUNT(*) FROM kaiten.tags
UNION ALL
SELECT 'cards', COUNT(*) FROM kaiten.cards;
```

### Check Last Sync Times
```sql
SELECT
  entity_type,
  last_synced_at,
  records_count,
  last_sync_duration_ms
FROM kaiten.sync_metadata
ORDER BY last_synced_at DESC;
```

### Find Recently Updated Cards
```sql
SELECT id, title, kaiten_updated_at, synced_at
FROM kaiten.cards
ORDER BY synced_at DESC
LIMIT 20;
```

---

**For detailed documentation, see [SETUP_COMPLETE.md](./SETUP_COMPLETE.md)**
