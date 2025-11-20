import { getServiceSupabaseClient } from "@/lib/supabase/server";

type TableRow = {
  schemaname: string;
  tablename: string;
};

type TableResult =
  | { status: "ok"; tables: TableRow[] }
  | { status: "missing-env"; message: string }
  | { status: "error"; message: string };

async function fetchTables(): Promise<TableResult> {
  const client = getServiceSupabaseClient();

  if (!client) {
    return {
      status: "missing-env",
      message: "Добавьте NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY, чтобы запросить список таблиц.",
    };
  }

  const { data, error } = await client
    .from("pg_tables")
    .select("schemaname, tablename")
    .in("schemaname", ["public", "kaiten"])
    .order("schemaname", { ascending: true })
    .order("tablename", { ascending: true });

  if (error) {
    return {
      status: "error",
      message: `Не удалось получить таблицы: ${error.message}`,
    };
  }

  return {
    status: "ok",
    tables: (data ?? []) as TableRow[],
  };
}

function groupTables(rows: TableRow[]) {
  return rows.reduce<Record<string, string[]>>((acc, row) => {
    acc[row.schemaname] = acc[row.schemaname] ? [...acc[row.schemaname], row.tablename] : [row.tablename];
    return acc;
  }, {});
}

export default async function Home() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const tableResult = await fetchTables();

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-16">
      <section className="space-y-2">
        <p className="text-sm font-semibold tracking-wide text-slate-500">ERP Mimirhead</p>
        <h1 className="text-4xl font-semibold">Next.js + Supabase bootstrap</h1>
        <p className="max-w-3xl text-lg text-slate-600">
          Этот дашборд разворачивает каркас Next.js и проверяет готовность подключения к Supabase, чтобы Vercel больше
          не отдавал 404.
        </p>
      </section>

      <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Deployment checklist</h2>
        <ul className="list-disc space-y-2 pl-5 text-slate-700">
          <li>
            Убедитесь, что переменные окружения
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>
            и
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            заданы на Vercel.
          </li>
          <li>
            Для серверных запросов добавьте
            <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code>
            (не проксируйте его в браузер).
          </li>
          <li>
            Запустите <code className="rounded bg-slate-100 px-1.5 py-0.5">npm run build</code> локально, чтобы проверить
            конфигурацию перед деплоем.
          </li>
        </ul>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Supabase client readiness</h3>
            <p className="text-slate-600">Проверьте, что публичные переменные заданы для клиентских запросов.</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              supabaseUrl && supabaseAnonKey ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}
          >
            {supabaseUrl && supabaseAnonKey ? "Configured" : "Missing env vars"}
          </span>
        </div>
        <div className="grid gap-2 text-sm text-slate-600">
          <p>
            <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span> {supabaseUrl ?? "not set"}
          </p>
          <p>
            <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span> {supabaseAnonKey ? "configured" : "not set"}
          </p>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Таблицы Supabase</h3>
            <p className="text-slate-600">Выводим список таблиц из схем public и kaiten.</p>
          </div>
        </div>

        {tableResult.status === "missing-env" && (
          <p className="text-sm text-amber-700">{tableResult.message}</p>
        )}

        {tableResult.status === "error" && (
          <p className="text-sm text-rose-700">{tableResult.message}</p>
        )}

        {tableResult.status === "ok" && tableResult.tables.length === 0 && (
          <p className="text-sm text-slate-600">Таблиц в выбранных схемах не найдено.</p>
        )}

        {tableResult.status === "ok" && tableResult.tables.length > 0 && (
          <div className="grid gap-4 text-sm text-slate-700">
            {Object.entries(groupTables(tableResult.tables)).map(([schema, tables]) => (
              <div key={schema} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-semibold text-slate-800">Схема: {schema}</p>
                  <span className="text-xs text-slate-500">{tables.length} табл.</span>
                </div>
                <div className="grid gap-1">
                  {tables.map((table) => (
                    <div
                      key={`${schema}-${table}`}
                      className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-slate-700 shadow-sm"
                    >
                      <span>{table}</span>
                      <span className="text-xs text-slate-400">table</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
