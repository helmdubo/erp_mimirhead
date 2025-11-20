/**
 * Admin страница для управления синхронизацией с Kaiten
 */

import { getSyncStatus } from "@/app/actions/sync-actions";
import { SyncControls } from "./sync-controls";

export const dynamic = "force-dynamic";

export default async function SyncAdminPage() {
  const syncData = await getSyncStatus();

  if ("error" in syncData) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="mb-8 text-3xl font-bold">Синхронизация с Kaiten</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">Ошибка подключения к БД</p>
          <p className="text-sm">{syncData.error}</p>
        </div>
      </main>
    );
  }

  const { metadata = [], recentLogs = [] } = syncData;

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Синхронизация с Kaiten</h1>
        <p className="mt-2 text-slate-600">
          Управление синхронизацией данных из Kaiten в базу данных
        </p>
      </div>

      {/* Управление синхронизацией */}
      <section className="mb-8 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">Управление</h2>
        <SyncControls />
      </section>

      {/* Статус по таблицам */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Статус таблиц</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metadata.map((meta: any) => (
            <div
              key={meta.entity_type}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">{meta.entity_type}</h3>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    meta.status === "running"
                      ? "bg-blue-100 text-blue-800"
                      : meta.status === "error"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {meta.status}
                </span>
              </div>

              <div className="space-y-1 text-sm text-slate-600">
                <p>
                  <span className="font-medium">Записей:</span>{" "}
                  {meta.total_records.toLocaleString()}
                </p>

                {meta.last_full_sync_at && (
                  <p>
                    <span className="font-medium">Полная:</span>{" "}
                    {new Date(meta.last_full_sync_at).toLocaleString("ru")}
                  </p>
                )}

                {meta.last_incremental_sync_at && (
                  <p>
                    <span className="font-medium">Обновление:</span>{" "}
                    {new Date(meta.last_incremental_sync_at).toLocaleString(
                      "ru"
                    )}
                  </p>
                )}

                {meta.error_message && (
                  <p className="text-red-600">
                    <span className="font-medium">Ошибка:</span>{" "}
                    {meta.error_message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* История синхронизаций */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">История синхронизаций</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Тип</th>
                  <th className="px-4 py-3 font-semibold">Сущность</th>
                  <th className="px-4 py-3 font-semibold">Статус</th>
                  <th className="px-4 py-3 font-semibold">Записей</th>
                  <th className="px-4 py-3 font-semibold">Время</th>
                  <th className="px-4 py-3 font-semibold">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Нет записей о синхронизации
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                            log.sync_type === "full"
                              ? "bg-blue-100 text-blue-800"
                              : log.sync_type === "incremental"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {log.sync_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {log.entity_type}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                            log.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : log.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {log.records_processed > 0 ? (
                          <span>
                            {log.records_processed.toLocaleString()}
                            {log.records_created > 0 && (
                              <span className="text-green-600">
                                {" "}
                                (+{log.records_created})
                              </span>
                            )}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {log.duration_ms
                          ? `${(log.duration_ms / 1000).toFixed(1)}с`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(log.started_at).toLocaleString("ru", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Информация */}
      <section className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <h3 className="mb-2 font-semibold">💡 Как это работает:</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Полная синхронизация:</strong> Загружает все данные из
            Kaiten заново (может занять время)
          </li>
          <li>
            <strong>Обновить изменения:</strong> Загружает только измененные с
            последней синхронизации данные (быстрее)
          </li>
          <li>
            <strong>Быстрые действия:</strong> Синхронизируют только выбранные
            типы данных
          </li>
          <li>
            Порядок синхронизации автоматический: сначала справочники, потом
            карточки
          </li>
        </ul>
      </section>
    </main>
  );
}
