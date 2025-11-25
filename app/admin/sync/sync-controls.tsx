"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  syncAllData,
  syncIncrementalData,
  syncSpecificEntities,
  syncTimeLogsRange,
  syncForceEntities,
  syncTimeLogsYearParallel,
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

export function SyncControls({ onSyncComplete }: SyncControlsProps) {
  const router = useRouter(); // Используем роутер для обновления
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => formatLocalYmd(new Date()), []);
  const weekAgo = useMemo(() => formatLocalYmd(addDays(new Date(), -7)), []);

  const [timeLogsFrom, setTimeLogsFrom] = useState<string>(weekAgo);
  const [timeLogsTo, setTimeLogsTo] = useState<string>(today);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Общая обертка для обработки результата
  const runAction = async (actionFn: () => Promise<any>, successMsg: string) => {
    setSyncing(true);
    setStatus("Выполняется...");
    setError(null);
    setResults(null);

    try {
      // Ждем выполнения на сервере (теперь там await)
      const result = await actionFn();

      if (result.status === "error") {
        setError(result.error || result.message);
        setStatus("Ошибка");
      } else {
        setStatus(result.message || successMsg);
        setResults(result.results || []);
        // Мгновенно обновляем данные на странице
        router.refresh();
        if (onSyncComplete) onSyncComplete();
      }
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
          onClick={() => runAction(syncAllData, "Полная синхронизация завершена")}
          disabled={syncing}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {syncing ? "Синхронизация..." : "🔄 Полная синхронизация"}
        </button>

        <button
          onClick={() => runAction(syncIncrementalData, "Обновление завершено")}
          disabled={syncing}
          className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          {syncing ? "Обновление..." : "⚡ Обновить изменения"}
        </button>
      </div>

      {/* Быстрые действия */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 font-semibold text-slate-700">Быстрые действия:</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => runAction(() => syncSpecificEntities(["cards"]), "Карточки обновлены")}
            disabled={syncing}
            className="rounded bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 disabled:opacity-50"
          >
            Только карточки (быстро)
          </button>
          <button
            onClick={() => runAction(() => syncSpecificEntities(["users", "tags"]), "Справочники обновлены")}
            disabled={syncing}
            className="rounded bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200 disabled:opacity-50"
          >
            Пользователи и теги
          </button>
        </div>
      </div>

      {/* Таймшиты (Диапазон) */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 font-semibold text-slate-700">
          Таймшиты (без зависимостей)
        </h3>

        <div className="grid gap-3 sm:grid-cols-3 mb-4">
          <label className="block">
            <span className="text-xs text-slate-500">From</span>
            <input
              type="date"
              value={timeLogsFrom}
              onChange={(e) => setTimeLogsFrom(e.target.value)}
              disabled={syncing}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500">To</span>
            <input
              type="date"
              value={timeLogsTo}
              onChange={(e) => setTimeLogsTo(e.target.value)}
              disabled={syncing}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <div className="flex items-end">
            <button
              onClick={() => runAction(() => syncTimeLogsRange(timeLogsFrom, timeLogsTo), "Таймшиты загружены")}
              disabled={syncing}
              className="w-full rounded bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Загрузить диапазон
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t pt-3">
           <div className="flex items-center gap-2">
             <span className="text-sm text-slate-600">Весь год:</span>
             <select 
               value={selectedYear}
               onChange={(e) => setSelectedYear(Number(e.target.value))}
               className="rounded border border-slate-300 px-2 py-1 text-sm"
             >
               <option value={2025}>2025</option>
               <option value={2024}>2024</option>
               <option value={2023}>2023</option>
             </select>
           </div>
           <button
              onClick={() => runAction(() => syncTimeLogsYearParallel(selectedYear), `Год ${selectedYear} загружен`)}
              disabled={syncing}
              className="rounded bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-200 disabled:opacity-50"
            >
              🚀 Загрузить весь год (параллельно)
            </button>
        </div>
      </div>

      {/* Статус */}
      {status && (
        <div className={`rounded-lg p-4 ${error ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>
          <div className="flex items-center gap-2">
            {syncing && <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>}
            <p className="font-medium">{status}</p>
          </div>
          {error && <p className="mt-1 text-sm">{error}</p>}
        </div>
      )}
    </div>
  );
}