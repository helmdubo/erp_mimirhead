const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16">
      <section className="space-y-2">
        <p className="text-sm font-semibold tracking-wide text-slate-500">ERP Mimirhead</p>
        <h1 className="text-4xl font-semibold">Next.js + Supabase bootstrap</h1>
        <p className="max-w-3xl text-lg text-slate-600">
          This repository now ships a root-level Next.js 15 App Router project and local Supabase
          configuration so Vercel can build the app and initialize the database client.
        </p>
      </section>

      <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Deployment checklist</h2>
        <ul className="list-disc space-y-2 pl-5 text-slate-700">
          <li>Install dependencies with <code className="rounded bg-slate-100 px-2 py-0.5">npm install</code>.</li>
          <li>Set the Vercel project root to the repository root (contains <code className="rounded bg-slate-100 px-2 py-0.5">package.json</code>).</li>
          <li>
            Configure environment variables <code className="rounded bg-slate-100 px-2 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> and
            <code className="rounded bg-slate-100 px-2 py-0.5"> NEXT_PUBLIC_SUPABASE_ANON_KEY</code> for the Supabase project.
          </li>
          <li>Use <code className="rounded bg-slate-100 px-2 py-0.5">npm run build</code> to validate the deploy locally.</li>
        </ul>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Supabase client readiness</h3>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              supabaseUrl && supabaseAnonKey
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {supabaseUrl && supabaseAnonKey ? "Configured" : "Missing env vars"}
          </span>
        </div>
        <p className="text-slate-700">
          The Supabase client uses the generated <code className="rounded bg-slate-100 px-1.5 py-0.5">types/database.types.ts</code>
          for typed queries and expects the environment variables above to be set.
        </p>
        <div className="grid gap-2 text-sm text-slate-600">
          <p>
            <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span> {supabaseUrl ?? "not set"}
          </p>
          <p>
            <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span> {supabaseAnonKey ? "configured" : "not set"}
          </p>
        </div>
      </section>
    </main>
  );
}
