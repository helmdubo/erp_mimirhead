"use client";

/**
 * Клиентский компонент для управления синхронизацией
 */

import { useState } from "react";
import { syncAllData, syncIncrementalData, syncSpecificEntities } from "@/app/actions/sync-actions";

interface SyncControlsProps {
  onSyncComplete?: () => void;
}

export function SyncControls({ onSyncComplete }: SyncControlsProps) {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFullSync = async () => {
    setSyncing(true);
    setStatus("Запуск полной синхронизации...");
    setError(null);
    setResults(null);

    // Запускаем синхронизацию но не ждем ответа (fire-and-forget)
    syncAllData().catch(() => {
      // Игнорируем timeout error - синхронизация все равно продолжится в фоне
    });

    // Показываем пользователю информативное сообщение
    setStatus("⏳ Синхронизация запущена в фоне...");

    // Автоматически обновляем страницу через 90 секунд чтобы показать результаты
    setTimeout(() => {
      setStatus("🔄 Обновление страницы...");
      window.location.reload();
    }, 90000); // 90 секунд

    // Показываем инструкцию
    setTimeout(() => {
      setStatus("⏳ Синхронизация в процессе. Страница автоматически обновится через ~90 секунд.");
    }, 1000);
  };

  const handleIncrementalSync = async () => {
    setSyncing(true);
    setStatus("Запуск инкрементального обновления...");
    setError(null);
    setResults(null);

    // Запускаем синхронизацию но не ждем ответа (fire-and-forget)
    syncIncrementalData().catch(() => {
      // Игнорируем timeout error - синхронизация все равно продолжится в фоне
    });

    // Показываем пользователю информативное сообщение
    setStatus("⏳ Обновление запущено в фоне...");

    // Автоматически обновляем страницу через 60 секунд
    setTimeout(() => {
      setStatus("🔄 Обновление страницы...");
      window.location.reload();
    }, 60000); // 60 секунд (инкрементальное обновление быстрее)

    // Показываем инструкцию
    setTimeout(() => {
      setStatus("⏳ Обновление в процессе. Страница автоматически обновится через ~60 секунд.");
    }, 1000);
  };

  const handleQuickSync = async (entities: string[]) => {
    setSyncing(true);
    setStatus(`Синхронизация: ${entities.join(", ")}...`);
    setError(null);
    setResults(null);

    // Если синхронизируем карточки - используем fire-and-forget (могут быть тысячи)
    if (entities.includes("cards")) {
      syncSpecificEntities(entities).catch(() => {
        // Игнорируем timeout error
      });

      setStatus("⏳ Синхронизация карточек запущена в фоне...");

      setTimeout(() => {
        setStatus("🔄 Обновление страницы...");
        window.location.reload();
      }, 60000);

      setTimeout(() => {
        setStatus("⏳ Синхронизация карточек в процессе. Страница автоматически обновится через ~60 секунд.");
      }, 1000);

      return;
    }

    // Для других сущностей - ждем ответа (они быстрые)
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

  return (
    <div className="space-y-6">
      {/* Основные кнопки */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleFullSync}
          disabled={syncing}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {syncing ? "Синхронизация..." : "🔄 Полная синхронизация"}
        </button>

        <button
          onClick={handleIncrementalSync}
          disabled={syncing}
          className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </div>

      {/* Статус синхронизации */}
      {status && (
        <div
          className={`rounded-lg p-4 ${
            error
              ? "bg-red-50 text-red-800 border border-red-200"
              : syncing
              ? "bg-blue-50 text-blue-800 border border-blue-200"
              : "bg-green-50 text-green-800 border border-green-200"
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
          {error && (
            <p className="mt-2 text-sm opacity-80">Ошибка: {error}</p>
          )}
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
