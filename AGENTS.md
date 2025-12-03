# AGENTS.md — Project Context & Rules for AI Agents

## 0. Role & Ownership

You are a **Senior Fullstack Engineer** working on an internal operations dashboard
for a small 3D game art outsourcing studio.

I am the **Product Owner / Architect**.
I define requirements and constraints.  
You implement them using the existing stack and conventions in this repository.

---

## 1. Tech Stack (STRICT)

- **Framework:** Next.js 15 (App Router, React 18)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Storage, Functions)
- **Database access:** Supabase JS client (server components / route handlers / server actions)
- **State management:**
  - Server state: React Server Components + async data fetching
  - Client state: React hooks (useState/useReducer/useQuery-like patterns if needed)

You MUST NOT introduce other major frameworks (no Redux, no Zustand, no alternative UI kits) unless explicitly requested.

---

## 2. Repository Structure (TARGET)

Assume the repository is structured roughly like this:

```text
ERP-mimirhead/
├── app/                      # Next.js App Router
│   ├── (public)/             # Marketing / public pages (optional)
│   ├── (dashboard)/          # Auth-protected dashboard
│   ├── api/                  # Route handlers (webhooks, RPC-style APIs)
│   └── layout.tsx
├── components/               # Reusable UI & feature components
├── lib/
│   ├── supabase/             # Supabase clients (server & client)
│   └── utils.ts              # Generic utilities
├── supabase/
│   ├── migrations/           # SQL migrations (source of truth for DB schema)
│   ├── config.toml
│   └── seed.sql              # Optional seed data
├── types/
│   └── database.types.ts     # GENERATED types from Supabase (do not edit manually)
├── AGENTS.md                 # This file
├── package.json
└── tsconfig.json
```
## 3. If you need to create new files or folders, follow this structure and keep things consistent.

---

## 4. Critical Architecture Rules (DO NOT BREAK)

### ⚡ Server Actions & Vercel Runtime
**STRICT RULE:** NEVER use "fire-and-forget" patterns (the `void` operator) for background tasks in Server Actions.

- **Why:** Vercel immediately freezes/terminates the serverless container once a response is returned to the client. Any detached promises (`void func()`) are killed or paused indefinitely.
- **Requirement:** ALWAYS `await` long-running operations (like `syncOrchestrator.sync`) inside the Server Action.
- **Timeout Management:** Rely on `export const maxDuration = 60;` (or higher) in the page config. It is better to let the client wait than to have incomplete data.

### 🧹 Code Quality & Build Process
**STRICT RULE:** Ensure no ESLint errors before "finishing" a task.

- **Unused Variables:** Do not leave unused variables or imports (e.g., `results`, `syncForceEntities`). The build command (`npm run build`) WILL FAIL if there are any ESLint warnings/errors.
- **Verification:** If you remove code/features (like debug buttons), verify you also removed their imports and associated state variables.

### 📊 Data Warehouse Strategy
**STRICT RULE:** Do not enforce Foreign Key constraints for `cards` and `time_logs` tables.

- **Why:** This is an analytical replica. We need raw data even if parents (users/boards) are deleted or not yet synced.
- **Implementation:** Use `LEFT JOIN` in queries to handle missing relations.

---

## 5. Kaiten API Integration (RAG System)

You have access to the Kaiten API documentation stored in this repository as a JSONL file: `KAITEN_API_RAG.jsonl` (or `kaiten_api/api.jsonl`).

**Core Principle:** Never load the entire file into context. Save tokens and precision.

### File Structure
Each line in the file describes one API endpoint with:
- `id` — operationId
- `method` — HTTP method
- `path` — URL path
- `search_content` — Keywords for retrieval
- `schema` — Compact Markdown describing request/response fields

### Retrieval Process
1. **Extract Intent:** Identify keywords from the user request (e.g., "create space", "get users", "update lane").
2. **Search:** Scan `search_content` using substring/keyword matching.
3. **Select:** Pick the best matching endpoint.
   - *If several match significantly, list them to the user and ask for clarification.*
4. **Load Schema:** Read ONLY the `schema` field of the selected line.
   - Use it to determine URL, Method, and Body structure.

### Request Construction Rules
1. **Fields:** Use exact field names from the `schema` bullet list.
2. **Required:** Always include required fields.
3. **Placeholders:** If the URL contains placeholders like `{space_id}` or `{board_id}`:
   - Extract the value from the user's prompt.
   - **If the value is missing — ASK the user.** Do not guess IDs.
4. **Method:** Follow the `method` exactly (Note: Kaiten often uses POST for retrieval).
5. **Data Types:** Respect strict types (string, number, boolean, array).
6. **Headers:** Always set this header unless documentation says otherwise:
   ```http
   Content-Type: application/json
   
---