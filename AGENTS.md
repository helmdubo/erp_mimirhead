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
studio-dashboard/
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
