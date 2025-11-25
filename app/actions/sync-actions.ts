"use server";

/**
 * Server Actions для управления синхронизацией с Kaiten
 *
 * ОБНОВЛЕНИЕ (Fix Vercel Timeout):
 * Убран fire-and-forget (void), так как Vercel замораживает выполнение
 * контейнера сразу после возврата ответа. Теперь используем await,
 * чтобы процесс гарантированно завершился до ответа клиенту.
 */

import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { syncOrchestrator } from "@/lib/kaiten/sync-orchestrator";

type ActionResult =
  | { status: "ok"; message: string; results?: any[] }
  | { status: "error"; message: string; error?: string };

/**
 * Статус синка по всем сущностям + последние логи
 */
export async function getSyncStatus(): Promise<
  | { metadata: any[]; recentLogs: any[] }
  | { error: string }
> {
  const supabase = getServiceSupabaseClient();

  if (!supabase) {
    return { error: "Supabase client not available" };
  }

  try {
    const { data: metadata, error: metaErr } = await supabase
      .from("sync_metadata")
      .select("*")
      .order("entity_type", { ascending: true });

    if (metaErr) {
      return { error: metaErr.message };
    }

    const { data: recentLogs, error: logsErr } = await supabase
      .from("sync_logs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(50);

    if (logsErr) {
      return { error: logsErr.message };
    }

    return {
      metadata: metadata ?? [],
      recentLogs: recentLogs ?? [],
    };
  } catch (e: any) {
    return { error: e?.message ?? "Unknown error" };
  }
}

/**
 * Полная синхронизация всех сущностей.
 */
export async function syncAllData(): Promise<ActionResult> {
  try {
    // Await важен! Иначе Vercel убьет процесс.
    await syncOrchestrator.sync({
      resolveDependencies: true,
      incremental: false,
    });

    return {
      status: "ok",
      message: "Полная синхронизация успешно завершена",
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

/**
 * Инкрементальная синхронизация (updated_since).
 */
export async function syncIncrementalData(): Promise<ActionResult> {
  try {
    await syncOrchestrator.sync({
      resolveDependencies: true,
      incremental: true,
    });

    return {
      status: "ok",
      message: "Инкрементальное обновление завершено",
    };
  } catch (error: any) {
    console.error("Incremental Sync Error:", error);
    return {
      status: "error",
      message: "Ошибка инкрементального обновления",
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Синхронизация выбранных сущностей.
 * Теперь всегда ожидаем результат (await), чтобы гарантировать запись в БД.
 */
export async function syncSpecificEntities(
  entityTypes: string[],
  options?: { timeLogsFrom?: string; timeLogsTo?: string }
): Promise<ActionResult> {
  try {
    const results = await syncOrchestrator.sync({
      entityTypes: entityTypes as any,
      incremental: false,
      resolveDependencies: true,
      timeLogsFrom: options?.timeLogsFrom,
      timeLogsTo: options?.timeLogsTo,
    });

    return {
      status: "ok",
      message: `Синхронизация ${entityTypes.join(", ")} завершена`,
      results,
    };
  } catch (e: any) {
    console.error("Specific Sync Error:", e);
    return {
      status: "error",
      message: "Ошибка при выборочной синхронизации",
      error: e?.message ?? "Unknown error",
    };
  }
}

/**
 * Отдельное действие для синка таймшитов по диапазону дат.
 * Формат from/to: "YYYY-MM-DD".
 */
export async function syncTimeLogsRange(
  from: string,
  to: string
): Promise<ActionResult> {
  try {
    await syncOrchestrator.sync({
      entityTypes: ["time_logs"] as any,
      incremental: false,
      resolveDependencies: true,
      timeLogsFrom: from,
      timeLogsTo: to,
    });

    return {
      status: "ok",
      message: `Таймшиты успешно синхронизированы: ${from} → ${to}`,
    };
  } catch (error: any) {
    console.error("TimeLogs Sync Error:", error);
    return {
      status: "error",
      message: "Ошибка синхронизации таймшитов",
      error: error.message || "Unknown error",
    };
  }
}

/**
 * ПРИНУДИТЕЛЬНЫЙ синк только указанных сущностей БЕЗ зависимостей.
 * Используется для отладки.
 */
export async function syncForceEntities(
  entityTypes: string[]
): Promise<ActionResult> {
  try {
    // Await обязателен
    await syncOrchestrator.sync({
      entityTypes: entityTypes as any,
      incremental: false,
      resolveDependencies: false, // <--- ВАЖНО: Отключаем зависимости
    });

    return {
      status: "ok",
      message: `FORCE синк ${entityTypes.join(", ")} завершен`,
    };
  } catch (error: any) {
    console.error("Force Sync Error:", error);
    return {
      status: "error",
      message: "Ошибка FORCE синхронизации",
      error: error.message || "Unknown error",
    };
  }
}
