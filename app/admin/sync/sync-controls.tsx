 "use client";

/**
 * Клиентский компонент для управления синхронизацией
 */

import { useMemo, useState } from "react";
import {
  syncAllData,
  syncIncrementalData,
  syncSpecificEntities,
  syncTimeLogsRange,
} from "@/app/actions/sync-actions";

interface SyncControlsProps {
  onSyncComplete?: () => void;
}

function formatLocalYmd(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function isValidYmd(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function SyncControls({ onSyncComplete }: SyncControlsProps) {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => formatLocalYmd(new Date()), []);
  const weekAgo = useMemo(() => formatLocalYmd(addDays(new Date(), -7)), []);

  const [timeLogsFrom, setTimeLogsFrom] = useState<string>(weekAgo);
  const [timeLogsTo, setTimeLogsTo] = useState<string>(today);

  const handleFullSync = async () => {
    setSyncing(true);
    setStatus("Запуск полной синхронизации...");
    setError(null);
    setResults(null);

    // Запускаем синхронизацию но не ждем ответа (fire-and-forget)
    syncAllData().catch(() => {
      // Игнорируем timeout error - синхронизация все равно продолжится в фоне
    });

    setStatus("⏳ Синхронизация запущена в фоне...");

    setTimeout(() => {
      setStatus("🔄 Обновление страницы...");
      window.location.reload();
    }, 90000);

    setTimeout(() => {
      setStatus(
        "⏳ Синхронизация в процессе. Страница автоматически обновится через ~90 секунд."
      );
    }, 1000);
  };

  const handleIncrementalSync = async () => {
    setSyncing(true);
    setStatus("Запуск инкрементального обновления...");
    setError(null);
    setResults(null);

    syncIncrementalData().catch(() => {
      // Игнорируем timeout error - синхронизация все равно продолжится в фоне
    });

    setStatus("⏳ Обновление запущено в фоне...");

    setTimeout(() => {
      setStatus("🔄 Обновление страницы...");
      window.location.reload();
    }, 60000);

    setTimeout(() => {
      setStatus(
        "⏳ Обновление в процессе. Страница автоматически обновится через ~60 секунд."
      );
    }, 1000);
  };

  const handleQuickSync = async (entities: string[]) => {
    setSyncing(true);
    setStatus(`Синхронизация: ${entities.join(", ")}...`);
    setError(null);
    setResults(null);

    // Тяжёлые сущности — fire-and-forget
    if (entities.includes("cards") || entities.includes("time_logs")) {
      syncSpecificEntities(entities).catch(() => {
        // Игнорируем timeout error
      });

      setStatus("⏳ Синхронизация запущена в фоне...");

      setTimeout(() => {
        setStatus("🔄 Обновление страницы...");
        window.location.reload();
      }, 90000);

      setTimeout(() => {
        setStatus(
          "⏳ Синхронизация в процессе. Страница автоматически обновится через ~90 секунд."
        );
      }, 1000);

      return;
    }

    // Для быстрых сущностей - ждем ответа
    try {
      const result = await syncSpecificEntities(entities);

      if (result.status === "error") {
        setError(result.error || result.message);
        setStatus("Ошибка");
      } else {
        setStatus(result.message);
        setResults(result.results || []);
      }

      onSyncComplete?.();
    } catch (err: any) {
      setError(err.message);
      setStatus("Критическая ошибка");
    } finally {
      setSyncing(false);
    }
  };

  const handleTimeLogsRangeSync = async () => {
    setSyncing(true);
    setError(null);
    setResults(null);

    if (!isValidYmd(timeLogsFrom) || !isValidYmd(timeLogsTo)) {
      setError("Неверный формат даты. Используйте YYYY-MM-DD.");
      setStatus("Ошибка");
      setSyncing(false);
      return;
    }
    if (timeLogsFrom > timeLogsTo) {
      setError("Дата 'from' не может быть больше даты 'to'.");
      setStatus("Ошибка");
      setSyncing(false);
      return;
    }

    setStatus(`Запуск синка таймшитов: ${timeLogsFrom} → ${timeLogsTo}...`);

    // Таймлоги могут быть очень большими — запускаем в фоне
    syncTimeLogsRange(timeLogsFrom, timeLogsTo).catch(() => {
      // Игнорируем timeout error
    });

    setStatus("⏳ Синк таймшитов запущен в фоне...");

    setTimeout(() => {
      setStatus("🔄 Обновление страницы...");
      window.location.reload();
    }, 90000);

    setTimeout(() => {
      setStatus(
        "⏳ Таймшиты синхронизируются. Страница автоматически обновится через ~90 секунд."
      );
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Основные кнопки */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleFullSync}
          disabled={syncing}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {syncing ? "Синхронизация..." : "🔄 Полная синхронизация"}
        </button>

        <button
          onClick={handleIncrementalSync}
          disabled={syncing}
          className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {syncing ? "Обновление..." : "⚡ Обновить изменения"}
        </button>
      </div>

      {/* Быстрые действия */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 font-semibold text-slate-700">Быстрые действия:</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickSync(["cards"])}
            disabled={syncing}
            className="rounded bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 disabled:opacity-50"
          >
            Только карточки
          </button>
          <button
            onClick={() => handleQuickSync(["boards", "columns", "lanes"])}
            disabled={syncing}
            className="rounded bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 disabled:opacity-50"
          >
            Доски и структура
          </button>
          <button
            onClick={() => handleQuickSync(["users", "tags"])}
            disabled={syncing}
            className="rounded bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 disabled:opacity-50"
          >
            Пользователи и теги
          </button>
          <button
            onClick={() => handleQuickSync(["time_logs"])}
            disabled={syncing}
            className="rounded bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 disabled:opacity-50"
          >
            Только таймшиты (без диапазона)
          </button>
        </div>
      </div>

      {/* Таймшиты с диапазоном */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 font-semibold text-slate-700">
          Таймшиты (time_logs) — синк по диапазону дат
        </h3>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700">
              from <span className="text-red-600">*</span>
            </div>
            <input
              type="date"
              value={timeLogsFrom}
              onChange={(e) => setTimeLogsFrom(e.target.value)}
              disabled={syncing}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
              required
            />
          </label>

          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700">
              to <span className="text-red-600">*</span>
            </div>
            <input
              type="date"
              value={timeLogsTo}
              onChange={(e) => setTimeLogsTo(e.target.value)}
              disabled={syncing}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
              required
            />
          </label>

          <div className="flex items-end">
            <button
              onClick={handleTimeLogsRangeSync}
              disabled={syncing}
              className="w-full rounded bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {syncing ? "Запущено..." : "🚚 Синхронизировать таймшиты"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Под капотом будет использован эндпоинт вида:
          <code className="ml-1 rounded bg-slate-100 px-1 py-0.5">
            /time-logs?from=YYYY-MM-DD&amp;to=YYYY-MM-DD
          </code>
        </p>
      </div>

      {/* Статус синхронизации */}
      {status && (
        <div
          className={`rounded-lg p-4 ${
            error
              ? "border border-red-200 bg-red-50 text-red-800"
              : syncing
              ? "border border-blue-200 bg-blue-50 text-blue-800"
              : "border border-green-200 bg-green-50 text-green-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {syncing && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              )}
              <p className="font-medium">{status}</p>
            </div>
            {syncing && status.includes("автоматически обновится") && (
              <button
                onClick={() => window.location.reload()}
                className="rounded bg-white/80 px-3 py-1 text-sm font-medium hover:bg-white"
              >
                🔄 Обновить сейчас
              </button>
            )}
          </div>
          {error && <p className="mt-2 text-sm opacity-80">Ошибка: {error}</p>}
        </div>
      )}

      {/* Результаты синхронизации */}
      {results && results.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-700">Результаты:</h3>
          <div className="grid gap-2">
            {results.map((result, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  result.success
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div>
                  <p className="font-medium">
                    {result.success ? "✅" : "❌"} {result.entity_type}
                  </p>
                  {result.error && (
                    <p className="text-sm text-red-600">{result.error}</p>
                  )}
                </div>
                <div className="text-right text-sm">
                  <p>
                    Обработано: {result.records_processed} / Создано:{" "}
                    {result.records_created}
                  </p>
                  <p className="text-slate-500">
                    {(result.duration_ms / 1000).toFixed(1)}с
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
