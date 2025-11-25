/**
 * Страница для просмотра отладочных логов синхронизации
 */

import { getServiceSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DebugLogsPage() {
  const supabase = getServiceSupabaseClient();

  if (!supabase) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка</h1>
        <p>Supabase client не инициализирован</p>
      </div>
    );
  }

  const { data: logs, error } = await (supabase as any)
    .from('sync_debug_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка загрузки логов</h1>
        <pre className="bg-red-50 p-4 rounded text-sm">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Отладочные логи синхронизации</h1>
        <p className="text-slate-600 mt-2">
          Последние {logs?.length || 0} записей • Автообновление каждые 10 сек
        </p>
      </div>

      {!logs || logs.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium">Логи не найдены</p>
          <p className="text-yellow-600 text-sm mt-2">
            Возможно, ENABLE_DEBUG_LOGS=true не установлена в env переменных
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log: any) => (
            <div
              key={log.id}
              className={`rounded-lg border p-4 ${
                log.log_level === 'error'
                  ? 'bg-red-50 border-red-200'
                  : log.log_level === 'warning'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono px-2 py-1 rounded ${
                    log.log_level === 'error'
                      ? 'bg-red-100 text-red-800'
                      : log.log_level === 'warning'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {log.log_level.toUpperCase()}
                  </span>
                  {log.entity_type && (
                    <span className="text-xs font-mono px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {log.entity_type}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(log.created_at).toLocaleString('ru-RU')}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900">{log.message}</p>
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                    Metadata
                  </summary>
                  <pre className="mt-2 text-xs bg-slate-50 p-2 rounded overflow-auto max-h-64">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      <script dangerouslySetInnerHTML={{
        __html: `setTimeout(() => window.location.reload(), 10000);`
      }} />
    </div>
  );
}
