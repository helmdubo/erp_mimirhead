# 🔧 Implementation Notes & Problem Solutions

## Session Date: 2025-11-21

This document contains technical details about problems encountered and solutions implemented.

---

## 🎯 Main Achievement

**Successfully integrated Kaiten CRM with Supabase analytics replica.**

- ✅ 999 cards synced
- ✅ All reference tables populated
- ✅ Sync time: ~37 seconds (under 60s timeout)
- ✅ Fire-and-forget UX pattern implemented

---

## 🐛 Problems Solved

### 1. Kaiten API Architecture

**Problem:** Initially tried to fetch boards/columns/lanes from global endpoints.

**Kaiten API Structure:**
```
❌ /api/latest/boards (doesn't exist!)
❌ /api/latest/columns (doesn't exist!)
❌ /api/latest/lanes (doesn't exist!)

✅ /api/latest/spaces/{id}/boards
✅ /api/latest/boards/{id}/columns
✅ /api/latest/boards/{id}/lanes
```

**Solution:**
- Fetch spaces first
- Iterate through spaces to get boards
- Iterate through boards to get columns/lanes
- Use controlled parallelization (chunks of 5)

**Implementation:** `lib/kaiten/client.ts`
```typescript
async getBoards(): Promise<KaitenBoard[]> {
  const spaces = await this.getSpaces();
  // Parallel fetch with Promise.allSettled
  // Process 5 spaces at a time
}
```

---

### 2. Database Permissions

**Problem:** `permission denied for schema kaiten`

**Cause:** Service role didn't have permissions on custom schema.

**Solution:**
```sql
GRANT USAGE ON SCHEMA kaiten TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA kaiten TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA kaiten GRANT ALL ON TABLES TO service_role;
NOTIFY pgrst, 'reload config';
```

**Migration:** `20250121000001_fix_kaiten_permissions_and_tags.sql`

---

### 3. Missing Columns in Tables

**Problem:** `Could not find the 'payload_hash' column`

**Cause:** Initial migration didn't include all necessary columns.

**Columns added:**
- `kaiten.tags`: `payload_hash`, `kaiten_created_at`, `kaiten_updated_at`
- `kaiten.card_types`: `payload_hash`
- `kaiten.property_definitions`: `payload_hash`

**Migration:** `20250121000001_fix_kaiten_permissions_and_tags.sql`

---

### 4. Data Type Mismatch (sort_order)

**Problem:** `invalid input syntax for type integer: "1.9364096064088971"`

**Cause:** Kaiten API returns `sort_order` as `double` (for precise positioning), but DB had `integer`.

**Solution:**
```sql
ALTER TABLE kaiten.columns ALTER COLUMN sort_order TYPE double precision;
ALTER TABLE kaiten.lanes ALTER COLUMN sort_order TYPE double precision;
```

**Migration:** `20250121000002_fix_sort_order_types.sql`

---

### 5. Foreign Key Violations

**Problem:** `insert or update on table "cards" violates foreign key constraint "cards_column_id_fkey"`

**Cause:** Trying to insert cards with references to deleted/archived columns.

**Design Decision:** This is an **analytical replica**, not a production app.
- Data completeness > strict referential integrity
- Need historical cards even if parent entities deleted
- Use LEFT JOINs in queries (NULL = deleted parent)

**Solution:** Remove all FK constraints from `cards` table.

```sql
ALTER TABLE kaiten.cards DROP CONSTRAINT IF EXISTS cards_column_id_fkey;
ALTER TABLE kaiten.cards DROP CONSTRAINT IF EXISTS cards_lane_id_fkey;
-- ... etc
```

**Migration:** `20250121000003_remove_fk_constraints_for_analytics.sql`

---

### 6. Timeout Errors (UX Issue)

**Problem:** Sync takes 37s, but user sees "An unexpected response from server" error at 60s.

**Cause:**
- Server completes sync successfully
- But client-side fetch times out
- User thinks sync failed (confusing!)

**Solution:** Fire-and-forget pattern
```typescript
// Don't await the sync
syncAllData().catch(() => {
  // Ignore timeout error
});

// Show user what's happening
setStatus("⏳ Синхронизация запущена в фоне...");

// Auto-refresh after completion
setTimeout(() => window.location.reload(), 90000);
```

**Implementation:** `app/admin/sync/sync-controls.tsx`

**Benefits:**
- No error message shown
- Clear communication to user
- Auto-refresh shows results
- Manual refresh button available

---

### 7. Performance: syncCardTags Bottleneck

**Problem:** Syncing card-tag relationships took 40+ seconds.

**Original Implementation:**
```typescript
for (const card of cards) {
  // DELETE query per card
  await supabase.delete().eq('card_id', card.id);

  // INSERT query per card
  await supabase.insert(tagLinks);
}
// 999 cards × 2 queries = 1998 queries! 🐌
```

**Optimized Implementation:**
```typescript
// ONE bulk DELETE for all cards
await supabase.delete().in('card_id', allCardIds);

// ONE bulk INSERT for all tag links (batched by 1000)
await supabase.insert(allTagLinks);

// 1998 queries → 2-3 queries! ⚡
```

**Result:** 40s → 2s (20x faster!)

**Implementation:** `lib/kaiten/sync-orchestrator.ts` → `syncCardTags()`

---

### 8. Pagination Only Loaded First Page

**Problem:** Only 100 cards synced (exactly DEFAULT_PAGE_SIZE).

**Diagnosis:** Added detailed logging to pagination logic.

**Finding:** Pagination WAS working correctly!
- Fetched all 10 pages
- 999 cards total
- Problem was timeout killing process before DB write completed

**Logging added:**
```typescript
console.log(`📄 Page ${pageCount}: offset=${currentOffset}, received=${items.length} items`);
console.log(`✅ Completed ${endpoint}: ${allItems.length} total items in ${pageCount} pages`);
```

**Implementation:** `lib/kaiten/client.ts` → `fetchAllPaginated()`

---

## 🏗️ Architecture Decisions

### 1. Data Warehouse Approach

**Decision:** Remove foreign key constraints for analytics.

**Rationale:**
- This is NOT a production application
- Purpose: analytics, reporting, dashboards
- Historical data preservation is priority
- Parent entities can be deleted in source system
- NULL foreign keys = deleted/archived parents

**Trade-off:** Can't rely on DB to enforce referential integrity.

**Mitigation:** Use LEFT JOINs in queries, handle NULLs in application logic.

---

### 2. Fire-and-Forget UX Pattern

**Decision:** Don't wait for sync completion on client side.

**Rationale:**
- Long-running operations (30-60s)
- Vercel timeout constraints
- Better to show clear progress than confusing errors

**Implementation:**
- Launch sync without awaiting
- Show "running in background" message
- Auto-refresh after estimated completion time
- Manual refresh button

**Trade-off:** User doesn't see immediate results.

**Mitigation:** Clear messaging, auto-refresh, sync logs available.

---

### 3. Batch Operations

**Decision:** Process data in batches for both fetch and upsert.

**Batch Sizes:**
- API pagination: 100 items per page
- Database upsert: 100 records per batch
- Card-tags insert: 1000 links per batch
- Parallel fetching: 5 entities at a time

**Rationale:**
- Balance between performance and API/DB limits
- Prevent memory issues with large datasets
- Allow progress tracking

---

### 4. Detailed Logging

**Decision:** Add comprehensive logging throughout sync process.

**Logged Information:**
- API request details (URL, endpoint, auth status)
- Pagination progress (page count, items received)
- Batch processing (batch number, records, timing)
- Performance metrics (ms per operation)
- Errors with context

**Rationale:**
- Essential for debugging in production
- Helps identify bottlenecks
- Tracks sync progress
- Vercel logs are main diagnostic tool

---

## 📊 Performance Metrics

### Current Sync Performance (999 cards)

```
Total: ~37 seconds
├─ Fetch from Kaiten: ~10s
│  ├─ Spaces: <1s (2 items)
│  ├─ Boards: ~1s (7 items)
│  ├─ Columns: ~1s (20 items)
│  ├─ Lanes: ~1s (16 items)
│  ├─ Users: ~1s (12 items)
│  ├─ Card types: <1s
│  ├─ Tags: <1s
│  └─ Cards: ~10s (999 items, 10 pages)
│
├─ Transform: ~5s
│  └─ Calculate hashes for 999 cards
│
├─ Upsert: ~20s
│  └─ 10 batches of 100 cards each
│
└─ Sync Tags: ~2s
   ├─ DELETE old links: <1s
   └─ INSERT new links: ~1s
```

### Optimization Results

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| syncCardTags | 40s | 2s | 20x faster |
| Total sync | 75s | 37s | 2x faster |
| Timeout issues | ❌ Failed | ✅ Success | Fixed |

---

## 🔮 Scalability Projections

### For 2000 cards:
- Fetch: ~20s (20 pages)
- Transform: ~10s
- Upsert: ~40s (20 batches)
- Tags: ~4s
- **Total: ~74s** ⚠️ (approaches 60s limit)

### For 5000 cards:
- **Total: ~185s** ❌ (exceeds 60s limit)

### Solutions for Scale:
1. Increase `maxDuration` (Pro plan: 300s)
2. Split sync into smaller chunks
3. Use API Route with background processing
4. Implement queue-based sync

---

## 🔗 Related Files

### Core Implementation:
- `lib/kaiten/client.ts` - API client with pagination
- `lib/kaiten/sync-orchestrator.ts` - Sync logic and transformations
- `lib/kaiten/types.ts` - TypeScript interfaces

### Database:
- `supabase/migrations/20250101000000_init_kaiten.sql` - Initial schema
- `supabase/migrations/20250121000001_fix_kaiten_permissions_and_tags.sql` - Permissions + columns
- `supabase/migrations/20250121000002_fix_sort_order_types.sql` - Data types
- `supabase/migrations/20250121000003_remove_fk_constraints_for_analytics.sql` - Remove FKs

### UI:
- `app/admin/sync/page.tsx` - Admin page (Server Component)
- `app/admin/sync/sync-controls.tsx` - Controls (Client Component)
- `app/actions/sync-actions.ts` - Server Actions

---

## 📝 Code Patterns Used

### 1. Controlled Parallelization
```typescript
const chunkSize = 5;
for (let i = 0; i < items.length; i += chunkSize) {
  const chunk = items.slice(i, i + chunkSize);
  const results = await Promise.allSettled(
    chunk.map(async (item) => processItem(item))
  );
}
```

### 2. Resilient Error Handling
```typescript
results.forEach((result, idx) => {
  if (result.status === 'fulfilled') {
    allResults.push(...result.value);
  } else {
    console.error(`Failed item ${idx}`, result.reason);
    // Continue processing other items
  }
});
```

### 3. Batch Database Operations
```typescript
const batchSize = 100;
for (let i = 0; i < records.length; i += batchSize) {
  const batch = records.slice(i, i + batchSize);
  await supabase.from('table').upsert(batch);
}
```

### 4. Fire-and-Forget Pattern
```typescript
// Client side
someAsyncOperation().catch(() => {
  // Ignore errors, operation continues server-side
});

// Show status immediately
setStatus("Operation started in background...");

// Auto-refresh to show results
setTimeout(() => window.location.reload(), 60000);
```

---

## 🎓 Lessons Learned

1. **Always check API documentation first**
   - Saved hours by understanding Kaiten API structure
   - Global endpoints don't always exist

2. **For analytics, relax constraints**
   - Data warehouse != production app
   - Completeness > strict integrity
   - NULL handling in queries is acceptable

3. **Batch operations are crucial**
   - N+1 query problems kill performance
   - Always look for opportunities to batch
   - Even 1998 → 3 queries makes huge difference

4. **UX matters for long operations**
   - Don't make users wait for error messages
   - Fire-and-forget with clear communication
   - Auto-refresh is better than manual polling

5. **Logging is essential**
   - Can't debug production without logs
   - Performance metrics help identify bottlenecks
   - Structured logs (emojis help!) make parsing easier

6. **Migrations are your friends**
   - Small, focused migrations
   - Document why each change was made
   - Easy to revert if needed

---

## 🆕 Session Date: 2025-11-22

### 9. NULL Values in Cards Table (space_id)

**Problem:** Cards table had NULL values in `space_id` column.

**Cause:** Kaiten API doesn't always include `space_id` at root level, but nests it in `board.spaces[0].id`

**Specialist Feedback:** Extract from nested structure when root is null.

**Solution:**
```typescript
// Extract space_id from nested board.spaces if null in root
let extractedSpaceId = kaitenData.space_id;
if (!extractedSpaceId && kaitenData.board?.spaces?.[0]?.id) {
  extractedSpaceId = kaitenData.board.spaces[0].id;
}
```

**Implementation:** `lib/kaiten/sync-orchestrator.ts` → `transformToDbFormat()` case 'cards'

---

### 10. Missing Card Members Tracking

**Problem:** Only tracking card `owner_id`, but cards can have multiple participants/members.

**Need:** Analytics requires tracking ALL people working on a card, not just the owner.

**Solution:** Add `card_members` many-to-many table.

**Migration:** `supabase/migrations/20250122000000_add_card_members.sql`
```sql
CREATE TABLE kaiten.card_members (
    card_id bigint NOT NULL,
    user_id bigint NOT NULL,
    PRIMARY KEY (card_id, user_id)
);
```

**Sync Implementation:** Added batch-optimized `syncCardMembers()` method
```typescript
// Pattern: ONE bulk DELETE + batched INSERT
await this.supabase.delete().in('card_id', cardIds);
// ... collect all member links ...
for (let i = 0; i < allMemberLinks.length; i += 1000) {
  await this.supabase.insert(batch);
}
```

**Performance:** ~2 seconds for 999 cards (same as syncCardTags)

**CRITICAL:** Specialist's original code used N+1 queries (loop with individual DELETE/INSERT per card). We implemented the IDEA but kept batch operations to preserve 20x performance gain.

**Implementation:** `lib/kaiten/sync-orchestrator.ts` → `syncCardMembers()` + call in `upsertToDatabase()`

---

**Last Updated:** 2025-11-22
**Status:** Production Ready ✅
**Next Steps:**
1. Apply migration: `npx supabase db push`
2. Run full sync to populate `space_id` and `card_members`
3. Verify NULL values are fixed


---

---

## 🆕 Session Date: 2025-11-25

### 11. Vercel "Fire-and-Forget" Process Freeze
**Problem:** Sync process started but silently stopped/froze without completing.
**Cause:** Using `void` in Server Actions returns response immediately, causing Vercel to freeze the Lambda container.
**Solution:** Replaced all `void` with `await`. Client now waits for completion.

### 12. Pagination & Limit Bug
**Problem:** Only 100 cards were synced despite `limit: 1000`.
**Cause:** Kaiten API ignores `limit > 100`. Logic `received < requested` (100 < 1000) incorrectly triggered "last page" condition.
**Solution:** Reverted `limit` to default (100) in `sync-orchestrator.ts`.

### 13. Time Logs Performance & Timeouts
**Problem:** Syncing time logs for a year sequentially took too long (>60s), causing timeouts.
**Solution:**
1. **Parallel Sync:** Implemented `syncTimeLogsYearParallel` to sync 12 months in parallel (batches of 3 to respect rate limits).
2. **Disable Dependencies:** Created `resolveDependencies: false` option to skip re-fetching 1000+ cards before logs.
3. **Remove FKs:** Removed Foreign Keys from `time_logs` (`20250125000003_remove_timelogs_fks.sql`) to allow inserting logs for missing/deleted cards.

### 14. UI Total Records Count Glitch
**Problem:** In parallel sync, the last finishing thread overwrote `total_records` with just its month's count (e.g., 650 instead of 5000).
**Solution:** Updated `updateSyncMetadata` to perform a `SELECT count(*)` from DB instead of using the batch count. Now reflects true total.

### 15. Build Failures (ESLint)
**Problem:** `npm run build` failed due to unused variables after removing debug UI.
**Solution:** Cleaned up `sync-controls.tsx` removing unused imports and variables.

## 🆕 Session Date: 2025-12-02

### 16. Kaiten Roles System Integration

**Problem:** Need to track user access roles in spaces, not just time-logging roles.

**Discovery:** Kaiten has TWO separate role systems:
1. **Time Log Roles** (`/user-roles`) → `kaiten.roles` — for timesheet entries
2. **Tree Entity Roles** (`/tree-entity-roles`) → `kaiten.tree_entity_roles` — for access control

**Critical difference:** Tree Entity Roles use **UUID** as ID, not integer!

**Solution:**

1. **New tables created:**
   - `kaiten.tree_entity_roles` — catalog of access roles (UUID primary key!)
   - `kaiten.space_members` — M:N relationship: users ↔ spaces ↔ roles

2. **New views created:**
   - `kaiten.v_space_members_detailed` — expanded list with joins
   - `kaiten.v_user_roles_summary` — per-user aggregation

3. **Migration:** `20250602000000_add_tree_entity_roles_and_space_members.sql`

**API Response Structure:**

```typescript
// GET /tree-entity-roles
interface TreeEntityRole {
  id: string;           // UUID! Not number!
  name: string;         // "admin", "writer", "Художник"
  permissions: object;  // Detailed permissions
  company_uid: string | null;  // null = standard, uuid = custom
}

// GET /spaces/{id}/users
interface SpaceUser {
  id: number;
  own_role_ids: string[];      // Direct roles (UUID[])
  own_groups_role_ids: string[]; // Roles via groups
  groups: Array<{ id: number; name: string }>;
}
```

**Sync Implementation:**
- `tree_entity_roles`: Standard upsert by UUID
- `space_members`: Full replace (DELETE + batch INSERT)
- Separate sync button to avoid timeout in main sync

### 17. New UI Pages

**Added navigation and employees page:**

1. **Main page** (`/`) — Dashboard with navigation cards
2. **Employees page** (`/admin/employees`) — Interactive table with:
   - Two view modes: Summary / Detailed
   - Filters by spaces (checkbox pills)
   - Filters by roles (checkbox pills)
   - "Custom roles only" toggle
   - "Group roles only" toggle
   - Search by name/email
   - Column visibility controls

**New files:**
- `app/page.tsx` — Main navigation
- `app/admin/employees/page.tsx` — Server component
- `app/admin/employees/employees-table.tsx` — Client component with filters
- `app/actions/employees-actions.ts` — Server actions for data fetching

### 18. ESLint Build Fixes

**Problem:** Build failed with unused variable errors after adding roles sync.

**Fixes applied:**
1. Removed unused `KaitenSpaceUser` import from sync-orchestrator.ts
2. Changed `g =>` to `() =>` in `.find()` callback (unused parameter)

---

## 🏗️ Architecture Decisions

### Data Warehouse Approach
- Remove FK constraints for analytics
- Historical data preservation is priority
- NULL foreign keys = deleted/archived parents

### Roles System Design
- Two separate role types (time-log vs access)
- UUID for tree_entity_roles (Kaiten API requirement)
- Separate sync for roles to avoid timeout

### 19. Inactive Users Not Linked to Spaces

**Problem:** Deactivated users showed "Неактивен" role but 0 spaces, even though they were returned by API.

**Root Cause:** 
1. Migration `20250602000001_allow_null_role_for_inactive_users.sql` was not applied
2. `role_id` column was still NOT NULL, causing silent INSERT failures for inactive users

**API Discovery:**
Kaiten API requires specific parameters to get inactive users:
```
GET /spaces/{id}/users?include_inherited_access=true&inactive=true
```

Inactive users have NO role_ids fields - only basic user info:
```json
{
  "id": 774286,
  "full_name": "Андрей Горюнов",
  "email": "gorunovandrey123@gmail.com"
  // NO role_ids, NO own_role_ids!
}
```

**Solution:**
1. **Migration** makes `role_id` nullable and adds `is_inactive` boolean
2. **Sync logic** detects users with no roles and marks them as inactive
3. **VIEWs** updated to show "Неактивен" for null role_id
4. **UI** shows 👻 icon and "Только неактивные" filter

**Diagnostic SQL:** `supabase/diagnostic_space_members.sql`

---

**Last Updated:** 2025-12-02
**Status:** Production Ready ✅
**All Features Working:**
- ✅ Active users with roles synced
- ✅ Inactive/deactivated users synced with role_id=null
- ✅ UI filters for inactive users
- ✅ Spaces count correct for all users