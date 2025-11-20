# ERP Mimirhead

Root-level Next.js 15 (App Router) scaffold with Supabase configuration for the internal ERP dashboard.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the dev server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000.

## Supabase setup

- Project settings are stored in `supabase/config.toml`.
- Schemas live in `supabase/migrations/` (initial Kaiten mirror is already committed).
- Generated types are in `types/database.types.ts` and power the Supabase client in `lib/supabase/client.ts`.

If you need to refresh types after altering migrations, run the Supabase CLI:
```bash
supabase gen types typescript --local > types/database.types.ts
```

## Environment variables (Vercel / local)

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
# Optional for server-only calls
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Set the Vercel project root to this repository root (where `package.json` lives) so the build can locate the Next.js app.
