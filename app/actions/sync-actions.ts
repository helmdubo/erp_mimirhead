"use server";

/**
 * Server Actions для синхронизации с Kaiten
 * Могут вызываться напрямую из клиентских компонентов
 */

import { syncOrchestrator } from "@/lib/kaiten";
import { revalidatePath } from "next/cache";

export type SyncStatus = "idle" | "syncing" | "success" | "error";

export interface SyncActionResult {
  status: SyncStatus;
  message: string;
  results?: any[];
  error?: string;
}

/**
 * Полная синхронизация всех данных
 */
export async function syncAllData(): Promise<SyncActionResult> {
  try {
    console.log("Starting full sync...");

    const results = await syncOrchestrator.sync({
      incremental: false,
      resolveDependencies: true,
    });

    const hasErrors = results.some((r) => !r.success);

    // Инвалидируем кэш страниц после синхронизации
    revalidatePath("/admin");
    revalidatePath("/cards");

    return {
      status: hasErrors ? "error" : "success",
      message: hasErrors
        ? "Синхронизация завершена с ошибками"
        : `Успешно синхронизировано ${results.length} типов данных`,
      results,
    };
  } catch (error: any) {
    console.error("Full sync error:", error);
    return {
      status: "error",
      message: "Ошибка синхронизации",
      error: error.message,
    };
  }
}

/**
 * Инкрементальная синхронизация (только измененные данные)
 */
export async function syncIncrementalData(): Promise<SyncActionResult> {
  try {
    console.log("Starting incremental sync...");

    const results = await syncOrchestrator.sync({
      incremental: true,
      resolveDependencies: true,
    });

    const hasErrors = results.some((r) => !r.success);

    revalidatePath("/admin");
    revalidatePath("/cards");

    return {
      status: hasErrors ? "error" : "success",
      message: hasErrors
        ? "Обновление завершено с ошибками"
        : `Успешно обновлено ${results.length} типов данных`,
      results,
    };
  } catch (error: any) {
    console.error("Incremental sync error:", error);
    return {
      status: "error",
      message: "Ошибка обновления данных",
      error: error.message,
    };
  }
}

/**
 * Синхронизация конкретных типов данных
 */
export async function syncSpecificEntities(
  entities: string[],
  incremental = false
): Promise<SyncActionResult> {
  try {
    console.log(`Syncing entities: ${entities.join(", ")}`);

    const results = await syncOrchestrator.sync({
      entityTypes: entities as any,
      incremental,
      resolveDependencies: true,
    });

    const hasErrors = results.some((r) => !r.success);

    revalidatePath("/admin");
    revalidatePath("/cards");

    return {
      status: hasErrors ? "error" : "success",
      message: hasErrors
        ? `Синхронизация ${entities.join(", ")} завершена с ошибками`
        : `Успешно синхронизировано: ${entities.join(", ")}`,
      results,
    };
  } catch (error: any) {
    console.error("Specific entities sync error:", error);
    return {
      status: "error",
      message: "Ошибка синхронизации",
      error: error.message,
    };
  }
}

/**
 * Получить статус последней синхронизации
 */
export async function getSyncStatus() {
  try {
    const { getServiceSupabaseClient } = await import("@/lib/supabase/server");
    const supabase = getServiceSupabaseClient();

    if (!supabase) {
      return { error: "Database not available" };
    }

    // Получаем метаданные всех сущностей
    const { data: metadata } = await supabase
      .from("sync_metadata")
      .select("*")
      .order("entity_type");

    // Получаем последние логи
    const { data: recentLogs } = await supabase
      .from("sync_logs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(10);

    return {
      metadata: metadata || [],
      recentLogs: recentLogs || [],
    };
  } catch (error: any) {
    console.error("Get sync status error:", error);
    return { error: error.message };
  }
}
