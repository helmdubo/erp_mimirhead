import { getServiceSupabaseClient } from "@/lib/supabase/server";

export default async function DebugPage() {
  const client = getServiceSupabaseClient();

  const results = {
    hasClient: !!client,
    envVars: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing",
    },
    tests: {} as Record<string, any>,
  };

  if (client) {
    // Test 1: Простой запрос к схеме kaiten
    try {
      const { data: usersCheck, error: usersError } = await client
        .from("kaiten.users" as any)
        .select("count", { count: "exact", head: true });

      results.tests["kaiten.users table exists"] = {
        success: !usersError,
        error: usersError?.message,
        count: usersCheck,
      };
    } catch (e: any) {
      results.tests["kaiten.users table exists"] = {
        success: false,
        error: e.message,
      };
    }

    // Test 2: Проверка функции list_tables
    try {
      // @ts-expect-error - function may not be in types yet
      const { data: tablesData, error: tablesError } = await client.rpc("list_tables");

      results.tests["list_tables RPC function"] = {
        success: !tablesError,
        error: tablesError?.message,
        data: tablesData,
      };
    } catch (e: any) {
      results.tests["list_tables RPC function"] = {
        success: false,
        error: e.message,
      };
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-bold">Debug Information</h1>

      <div className="space-y-6">
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Environment Variables</h2>
          <pre className="overflow-auto rounded bg-slate-100 p-4 text-sm">
            {JSON.stringify(results.envVars, null, 2)}
          </pre>
        </section>

        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Supabase Client</h2>
          <p>Has Client: {results.hasClient ? "✅ Yes" : "❌ No"}</p>
        </section>

        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Connection Tests</h2>
          <div className="space-y-4">
            {Object.entries(results.tests).map(([testName, result]) => (
              <div key={testName} className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">
                  {result.success ? "✅" : "❌"} {testName}
                </h3>
                <pre className="overflow-auto rounded bg-slate-100 p-2 text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
