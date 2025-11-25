 "use server";

/**
 * Server Actions для управления синхронизацией с Kaiten
 *
 * Важно:
 * - "тяжёлые" операции (cards, time_logs) мы запускаем в фоне
 *   чтобы не упираться в таймауты Vercel/браузера.
 */

import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { syncOrchestrator } from "@/lib/kaiten/sync-orchestrator";

type ActionResult =
  | { status: "ok"; message: string; results?: any[] }
  | { status: "error"; message: string; error?: string };

function isHeavy(entities: string[]): boolean {
  return entities.includes("cards") || entities.includes("time_logs");
}

export async function getSyncStatus(): Promise<
  | { metadata: any[]; recentLogs: any[] }
  | { error: string }
> {
  const supabase = getServiceSupabaseClient();

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

    return { metadata: metadata ?? [], recentLogs: recentLogs ?? [] };
  } catch (e: any) {
    return { error: e?.message ?? "Unknown error" };
  }
}

export async function syncAllData(): Promise<ActionResult> {
  // fire-and-forget
  void syncOrchestrator.sync({ incremental: false, resolveDependencies: true });

  return {
    status: "ok",
    message: "Синхронизация запущена в фоне",
  };
}

export async function syncIncrementalData(): Promise<ActionResult> {
  // fire-and-forget
  void syncOrchestrator.sync({ incremental: true, resolveDependencies: true });

  return {
    status: "ok",
    message: "Инкрементальный синк запущен в фоне",
  };
}

export async function syncSpecificEntities(
  entityTypes: string[],
  options?: { timeLogsFrom?: string; timeLogsTo?: string }
): Promise<ActionResult> {
  try {
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

    // лёгкие сущности — можно ждать результат (быстрее и UX приятнее)
    const results = await syncOrchestrator.sync({
      entityTypes: entityTypes as any,
      incremental: false,
      resolveDependencies: true,
      timeLogsFrom: options?.timeLogsFrom,
      timeLogsTo: options?.timeLogsTo,
    });

    return {
      status: "ok",
      message: "Синхронизация завершена",
      results,
    };
  } catch (e: any) {
    return {
      status: "error",
      message: "Ошибка синхронизации",
      error: e?.message ?? "Unknown error",
    };
  }
}

export async function syncTimeLogsRange(
  from: string,
  to: string
): Promise<ActionResult> {
  // всегда считаем тяжёлой операцией
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
