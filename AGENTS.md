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
- **Do Not Optimize:** Do not try to return "200 OK" early to improve UX. This WILL break the sync process.