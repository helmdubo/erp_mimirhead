"use server";

/**
 * Server Actions для управления синхронизацией с Kaiten
 *
 * Важно:
 * - тяжёлые сущности (cards, time_logs) запускаем в фоне (fire-and-forget),
 *   чтобы не упираться в таймауты Next/Vercel.
 */

import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { syncOrchestrator } from "@/lib/kaiten/sync-orchestrator";

type ActionResult =
  | { status: "ok"; message: string; results?: any[] }
  | { status: "error"; message: string; error?: string };

// Условно тяжёлые сущности (могут быть тысячи записей)
const HEAVY_ENTITIES = new Set<string>(["cards", "time_logs"]);

function isHeavy(entityTypes: string[]): boolean {
  return entityTypes.some((t) => HEAVY_ENTITIES.has(t));
}

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
 * Запускается в фоне (fire-and-forget).
 */
export async function syncAllData(): Promise<ActionResult> {
  void syncOrchestrator.sync({
    resolveDependencies: true,
    incremental: false,
  });

  return {
    status: "ok",
    message: "Полная синхронизация запущена в фоне",
  };
}

/**
 * Инкрементальная синхронизация (updated_since).
 */
export async function syncIncrementalData(): Promise<ActionResult> {
  void syncOrchestrator.sync({
    resolveDependencies: true,
    incremental: true,
  });

  return {
    status: "ok",
    message: "Инкрементальный синк запущен в фоне",
  };
}

/**
 * Быстрая синхронизация выбранных сущностей.
 *
 * - для тяжёлых (cards, time_logs) — fire-and-forget
 * - для лёгких — ждём результат и возвращаем подробности
 */
export async function syncSpecificEntities(
  entityTypes: string[],
  options?: { timeLogsFrom?: string; timeLogsTo?: string }
): Promise<ActionResult> {
  // Тяжёлые — только fire-and-forget
  if (isHeavy(entityTypes)) {
    void syncOrchestrator.sync({
      entityTypes: entityTypes as any,
      incremental: false,
      resolveDependencies: true,
      timeLogsFrom: options?.timeLogsFrom,
      timeLogsTo: options?.timeLogsTo,
    });

    return {
      status: "ok",
      message: "Синхронизация запущена в фоне",
    };
  }

  // Лёгкие — ждём результат
  try {
    const results = await syncOrchestrator.sync({
      entityTypes: entityTypes as any,
      incremental: false,
      resolveDependencies: true,
    });

    return {
      status: "ok",
      message: "Синхронизация завершена",
      results,
    };
  } catch (e: any) {
    return {
      status: "error",
      message: "Ошибка при синхронизации",
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
  // для таймлогов всегда используем fire-and-forget
  void syncOrchestrator.sync({
    entityTypes: ["time_logs"] as any,
    incremental: false,
    resolveDependencies: true,
    timeLogsFrom: from,
    timeLogsTo: to,
  });

  return {
    status: "ok",
    message: `Синк таймшитов запущен в фоне: ${from} → ${to}`,
  };
}
