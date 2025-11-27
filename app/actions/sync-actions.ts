"use server";

import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { syncOrchestrator } from "@/lib/kaiten/sync-orchestrator";

type ActionResult =
  | { status: "ok"; message: string; results?: any[] }
  | { status: "error"; message: string; error?: string };

function formatLocalYmd(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function getSyncStatus(): Promise<
  | { metadata: any[]; recentLogs: any[] }
  | { error: string }
> {
  const supabase = getServiceSupabaseClient();
  if (!supabase) return { error: "Supabase client not available" };

  try {
    const { data: metadata, error: metaErr } = await supabase
      .from("sync_metadata")
      .select("*")
      .order("entity_type", { ascending: true });
    if (metaErr) return { error: metaErr.message };

    const { data: recentLogs, error: logsErr } = await supabase
      .from("sync_logs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(50);
    if (logsErr) return { error: logsErr.message };

    return { metadata: metadata ?? [], recentLogs: recentLogs ?? [] };
  } catch (e: any) {
    return { error: e?.message ?? "Unknown error" };
  }
}

export async function syncAllData(): Promise<ActionResult> {
  try {
    // Явно перечисляем сущности БЕЗ time_logs
    // Это гарантирует, что мы уложимся в 60 секунд Vercel
    const entities: any[] = [
      'spaces', 'users', 'card_types', 'property_definitions', 'tags', 'roles',
      'boards', 'columns', 'lanes', 'cards'
    ];

    await syncOrchestrator.sync({
      entityTypes: entities, 
      resolveDependencies: true,
      incremental: false,
    });

    return {
      status: "ok",
      message: "Структура и карточки обновлены. Таймшиты загружайте отдельно.",
    };
  } catch (error: any) {
    console.error("Sync All Error:", error);
    return {
      status: "error",
      message: "Ошибка полной синхронизации",
      error: error.message || "Unknown error",
    };
  }
}

export async function syncIncrementalData(): Promise<ActionResult> {
  try {
    await syncOrchestrator.sync({ resolveDependencies: true, incremental: true });
    return { status: "ok", message: "Инкрементальное обновление завершено" };
  } catch (error: any) {
    return { status: "error", message: "Ошибка обновления", error: error.message };
  }
}

export async function syncSpecificEntities(
  entityTypes: string[],
  options?: { timeLogsFrom?: string; timeLogsTo?: string }
): Promise<ActionResult> {
  try {
    // ДЛЯ СКОРОСТИ: Если запрашиваем только time_logs, отключаем зависимости (карточки)
    // Так как база аналитическая, нам не обязательно иметь 100% FK целостность в моменте
    const resolveDependencies = !entityTypes.includes("time_logs") || entityTypes.length > 1;

    const results = await syncOrchestrator.sync({
      entityTypes: entityTypes as any,
      incremental: false,
      resolveDependencies, // Авто-отключение зависимостей для чистого синка таймлогов
      timeLogsFrom: options?.timeLogsFrom,
      timeLogsTo: options?.timeLogsTo,
    });

    return { status: "ok", message: `Синхронизация ${entityTypes.join(", ")} завершена`, results };
  } catch (e: any) {
    return { status: "error", message: "Ошибка при выборочной синхронизации", error: e?.message };
  }
}

export async function syncTimeLogsRange(from: string, to: string): Promise<ActionResult> {
  try {
    await syncOrchestrator.sync({
      entityTypes: ["time_logs"] as any,
      incremental: false,
      resolveDependencies: false, // ВАЖНО: Отключаем скачивание карточек (экономит ~25 сек)
      timeLogsFrom: from,
      timeLogsTo: to,
    });
    return { status: "ok", message: `Таймшиты успешно синхронизированы: ${from} → ${to}` };
  } catch (error: any) {
    return { status: "error", message: "Ошибка синхронизации таймшитов", error: error.message };
  }
}

export async function syncForceEntities(entityTypes: string[]): Promise<ActionResult> {
  try {
    await syncOrchestrator.sync({
      entityTypes: entityTypes as any,
      incremental: false,
      resolveDependencies: false,
    });
    return { status: "ok", message: `FORCE синк ${entityTypes.join(", ")} завершен` };
  } catch (error: any) {
    return { status: "error", message: "Ошибка FORCE синхронизации", error: error.message };
  }
}

/**
 * Параллельная синхронизация года по месяцам.
 * Разбивает год на 12 месяцев и грузит их пачками по 3, чтобы не убить лимит 5 req/s.
 */
export async function syncTimeLogsYearParallel(year: number): Promise<ActionResult> {
  const months = Array.from({ length: 12 }, (_, i) => i);
  const concurrencyLimit = 3; // Грузим по 3 месяца одновременно (Kaiten limit 5 req/s)
  
  console.log(`🚀 Starting parallel sync for year ${year}...`);

  // Разбиваем на чанки по 3 месяца
  for (let i = 0; i < months.length; i += concurrencyLimit) {
    const chunk = months.slice(i, i + concurrencyLimit);
    
    await Promise.all(chunk.map(async (monthIndex) => {
      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex + 1, 0);
      const from = formatLocalYmd(startDate);
      const to = formatLocalYmd(endDate);

      try {
        await syncOrchestrator.sync({
          entityTypes: ["time_logs"] as any,
          incremental: false,
          resolveDependencies: false, // СТРОГО БЕЗ ЗАВИСИМОСТЕЙ
          timeLogsFrom: from,
          timeLogsTo: to,
        });
        console.log(`✅ Month ${monthIndex + 1} synced`);
      } catch (e) {
        console.error(`❌ Month ${monthIndex + 1} failed`, e);
        throw e;
      }
    }));
  }

  return { status: "ok", message: `Год ${year} успешно синхронизирован` };
}