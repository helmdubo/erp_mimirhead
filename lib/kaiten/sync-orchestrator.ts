/**
 * Sync Orchestrator
 * Управляет синхронизацией данных с Kaiten, разрешает зависимости.
 *
 * Особенности:
 * - Для time_logs используем from/to, потому что ваш эндпоинт именно такой.
 * - sync_metadata пишем через UPSERT, чтобы новые сущности автоматически появлялись в UI.
 */

import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { kaitenClient, kaitenUtils } from "./client";

export type EntityType =
  | "spaces"
  | "boards"
  | "columns"
  | "lanes"
  | "users"
  | "card_types"
  | "property_definitions"
  | "tags"
  | "cards"
  | "time_logs";

const DEPENDENCY_GRAPH: Record<EntityType, EntityType[]> = {
  spaces: [],
  users: [],
  card_types: [],
  property_definitions: [],
  tags: [],
  boards: ["spaces", "users"],
  columns: ["boards"],
  lanes: ["boards"],
  cards: ["boards", "columns", "lanes", "users", "card_types", "tags"],
  time_logs: ["users", "cards"],
};

interface SyncResult {
  entity_type: EntityType;
  success: boolean;
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_skipped: number;
  error?: string;
  duration_ms: number;
}

interface SyncOptions {
  entityTypes?: EntityType[];
  incremental?: boolean;
  resolveDependencies?: boolean;
  /** Используется ТОЛЬКО для time_logs */
  timeLogsFrom?: string; // YYYY-MM-DD
  /** Используется ТОЛЬКО для time_logs */
  timeLogsTo?: string; // YYYY-MM-DD
}

function toYmd(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysUtc(d: Date, days: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

export class SyncOrchestrator {
  private supabase = getServiceSupabaseClient();

  async sync(options: SyncOptions = {}): Promise<SyncResult[]> {
    const {
      entityTypes,
      incremental = false,
      resolveDependencies = true,
      timeLogsFrom,
      timeLogsTo,
    } = options;

    if (!this.supabase) throw new Error("Supabase client not available");

    let entitiesToSync =
      entityTypes || (Object.keys(DEPENDENCY_GRAPH) as EntityType[]);

    if (resolveDependencies) {
      entitiesToSync = this.resolveDependencies(entitiesToSync);
    }

    const sortedEntities = this.topologicalSort(entitiesToSync);

    const results: SyncResult[] = [];

    for (const entityType of sortedEntities) {
      try {
        const result = await this.syncEntity(
          entityType,
          incremental,
          timeLogsFrom,
          timeLogsTo
        );
        results.push(result);

        // Структурные сущности критичны: если упали — стопаемся
        if (
          !result.success &&
          ["spaces", "boards", "columns", "lanes"].includes(entityType)
        ) {
          break;
        }
      } catch (e: any) {
        results.push({
          entity_type: entityType,
          success: false,
          records_processed: 0,
          records_created: 0,
          records_updated: 0,
          records_skipped: 0,
          error: e?.message ?? "Unknown error",
          duration_ms: 0,
        });
      }
    }

    return results;
  }

  private async syncEntity(
    entityType: EntityType,
    incremental: boolean,
    timeLogsFrom?: string,
    timeLogsTo?: string
  ): Promise<SyncResult> {
    const startTime = Date.now();

    const logId = await this.createSyncLog(
      entityType,
      incremental ? "incremental" : "full"
    );

    await this.upsertSyncMetadata(entityType, { status: "running" });

    try {
      const metadata = await this.getSyncMetadata(entityType);

      const updatedSince =
        incremental && metadata?.last_incremental_sync_at
          ? metadata.last_incremental_sync_at
          : undefined;

      // формируем параметры запроса
      const fetchParams: Record<string, any> = {};
      if (updatedSince) fetchParams.updated_since = updatedSince;

      // Специфика time_logs: always from/to
      if (entityType === "time_logs") {
        const today = toYmd(new Date());

        // Если диапазон задан из UI — уважаем его
        const from =
          timeLogsFrom ??
          (incremental && metadata?.last_incremental_sync_at
            ? toYmd(new Date(metadata.last_incremental_sync_at))
            : toYmd(addDaysUtc(new Date(), -30))); // разумный дефолт "полного" синка

        const to = timeLogsTo ?? today;

        fetchParams.from = from;
        fetchParams.to = to;
        delete fetchParams.updated_since;
      }

      const kaitenData = await this.fetchFromKaiten(entityType, fetchParams);

      const stats = await this.upsertToDatabase(entityType, kaitenData);

      await this.upsertSyncMetadata(entityType, {
        status: "idle",
        error_message: null,
        total_records: stats.total,
        ...(incremental
          ? { last_incremental_sync_at: new Date().toISOString() }
          : { last_full_sync_at: new Date().toISOString() }),
      });

      const duration = Date.now() - startTime;
      await this.completeSyncLog(logId, stats, duration);

      return {
        entity_type: entityType,
        success: true,
        ...stats,
        duration_ms: duration,
      };
    } catch (e: any) {
      const duration = Date.now() - startTime;

      await this.upsertSyncMetadata(entityType, {
        status: "error",
        error_message: e?.message ?? "Unknown error",
      });

      await this.failSyncLog(logId, e?.message ?? "Unknown error", duration);

      return {
        entity_type: entityType,
        success: false,
        records_processed: 0,
        records_created: 0,
        records_updated: 0,
        records_skipped: 0,
        error: e?.message ?? "Unknown error",
        duration_ms: duration,
      };
    }
  }

  private async fetchFromKaiten(
    entityType: EntityType,
    params?: any
  ): Promise<any[]> {
    switch (entityType) {
      case "spaces":
        return kaitenClient.getSpaces(params);
      case "boards":
        return kaitenClient.getBoards();
      case "columns":
        return kaitenClient.getColumns();
      case "lanes":
        return kaitenClient.getLanes();
      case "users":
        return kaitenClient.getUsers(params);
      case "card_types":
        return kaitenClient.getCardTypes();
      case "property_definitions":
        return kaitenClient.getPropertyDefinitions();
      case "tags":
        return kaitenClient.getTags();
      case "cards":
        return kaitenClient.getCards(params);
      case "time_logs":
        return kaitenClient.getTimeLogs(params);
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }
  }

  private async upsertToDatabase(
    entityType: EntityType,
    data: any[]
  ): Promise<{
    total: number;
    records_processed: number;
    records_created: number;
    records_updated: number;
    records_skipped: number;
  }> {
    if (!this.supabase) throw new Error("Supabase not available");

    const stats = {
      total: data.length,
      records_processed: 0,
      records_created: 0,
      records_updated: 0,
      records_skipped: 0,
    };

    if (data.length === 0) return stats;

    const dbRows = await Promise.all(
      data.map(async (item) => this.transformToDbFormat(entityType, item))
    );

    const batchSize = 200;
    for (let i = 0; i < dbRows.length; i += batchSize) {
      const batch = dbRows.slice(i, i + batchSize);

      const { error } = await this.supabase
        .schema("kaiten")
        .from(entityType)
        .upsert(batch as any, { onConflict: "id" });

      if (error) throw error;

      stats.records_processed += batch.length;
      stats.records_updated += batch.length;
    }

    return stats;
  }

  private async transformToDbFormat(
    entityType: EntityType,
    kaitenData: any
  ): Promise<any> {
    const payloadHash = await kaitenUtils.calculatePayloadHash(kaitenData);

    const base: any = {
      id: kaitenData.id,
      uid: kaitenData.uid || null,
      synced_at: new Date().toISOString(),
      payload_hash: payloadHash,
      raw_payload: kaitenData,
    };

    // Чтобы не хранить “роман” в raw_payload для time_logs — чистим вложенности
    if (entityType === "time_logs" && kaitenData && typeof kaitenData === "object") {
      const cleaned = { ...kaitenData };
      delete cleaned.card;
      delete cleaned.user;
      delete cleaned.owner;
      delete cleaned.author;
      delete cleaned.role;
      delete cleaned.tags;
      delete cleaned.board;
      delete cleaned.lane;
      delete cleaned.column;
      delete cleaned.parents;
      delete cleaned.children;
      base.raw_payload = cleaned;
    }

    switch (entityType) {
      case "spaces":
        return {
          ...base,
          title: kaitenData.title,
          company_id: kaitenData.company_id || null,
          owner_user_id: kaitenData.owner_user_id || null,
          archived: kaitenData.archived || false,
          sort_order: kaitenData.sort_order || null,
          kaiten_created_at: kaitenData.created
            ? new Date(kaitenData.created).toISOString()
            : null,
          kaiten_updated_at: kaitenData.updated
            ? new Date(kaitenData.updated).toISOString()
            : null,
        };

      case "boards":
        return {
          ...base,
          space_id: kaitenData.space_id,
          title: kaitenData.title,
          description: kaitenData.description || null,
          board_type: kaitenData.board_type || null,
          archived: kaitenData.archived || false,
          sort_order: kaitenData.sort_order || null,
          kaiten_created_at: kaitenData.created
            ? new Date(kaitenData.created).toISOString()
            : null,
          kaiten_updated_at: kaitenData.updated
            ? new Date(kaitenData.updated).toISOString()
            : null,
        };

      case "columns":
        return {
          ...base,
          title: kaitenData.title,
          board_id: kaitenData.board_id,
          column_type: kaitenData.type,
          sort_order: kaitenData.sort_order ?? null,
          wip_limit: kaitenData.wip_limit ?? null,
          archived: kaitenData.archived || false,
          kaiten_created_at: kaitenData.created
            ? new Date(kaitenData.created).toISOString()
            : null,
          kaiten_updated_at: kaitenData.updated
            ? new Date(kaitenData.updated).toISOString()
            : null,
        };

      case "lanes":
        return {
          ...base,
          title: kaitenData.title,
          board_id: kaitenData.board_id,
          sort_order: kaitenData.sort_order ?? null,
          archived: kaitenData.archived || false,
          kaiten_created_at: kaitenData.created
            ? new Date(kaitenData.created).toISOString()
            : null,
          kaiten_updated_at: kaitenData.updated
            ? new Date(kaitenData.updated).toISOString()
            : null,
        };

      case "users":
        return {
          ...base,
          full_name: kaitenData.full_name,
          email: kaitenData.email,
          username: kaitenData.username,
          timezone: kaitenData.timezone,
          role: kaitenData.role,
          is_admin: kaitenData.is_admin || false,
          take_licence: kaitenData.take_licence,
          apps_permissions: kaitenData.apps_permissions,
          locked: kaitenData.locked,
          last_request_date: kaitenData.last_request_date
            ? new Date(kaitenData.last_request_date).toISOString()
            : null,
          kaiten_created_at: kaitenData.created
            ? new Date(kaitenData.created).toISOString()
            : null,
          kaiten_updated_at: kaitenData.updated
            ? new Date(kaitenData.updated).toISOString()
            : null,
        };

      case "card_types":
        return {
          ...base,
          name: kaitenData.name,
          icon_url: kaitenData.icon_url,
          kaiten_created_at: kaitenData.created
            ? new Date(kaitenData.created).toISOString()
            : null,
          kaiten_updated_at: kaitenData.updated
            ? new Date(kaitenData.updated).toISOString()
            : null,
        };

      case "property_definitions":
        return {
          ...base,
          name: kaitenData.name || "Untitled Property",
          field_type: kaitenData.type,
          select_options: kaitenData.select_options || null,
          kaiten_created_at: kaitenData.created
            ? new Date(kaitenData.created).toISOString()
            : null,
          kaiten_updated_at: kaitenData.updated
            ? new Date(kaitenData.updated).toISOString()
            : null,
        };

      case "tags":
        return {
          ...base,
          name: kaitenData.name,
          color: kaitenData.color,
          group_name: kaitenData.group_name,
          kaiten_created_at: kaitenData.created
            ? new Date(kaitenData.created).toISOString()
            : null,
          kaiten_updated_at: kaitenData.updated
            ? new Date(kaitenData.updated).toISOString()
            : null,
        };

      case "cards": {
        let extractedSpaceId = kaitenData.space_id || null;
        if (
          !extractedSpaceId &&
          kaitenData.board &&
          Array.isArray(kaitenData.board.spaces) &&
          kaitenData.board.spaces.length > 0
        ) {
          extractedSpaceId = kaitenData.board.spaces[0].id;
        }

        const membersIds = Array.isArray(kaitenData.members)
          ? kaitenData.members.map((m: any) => m?.id).filter(Boolean)
          : [];

        const parentIds = Array.isArray(kaitenData.parents_ids)
          ? kaitenData.parents_ids
          : Array.isArray(kaitenData.parents)
          ? kaitenData.parents.map((p: any) => p?.id).filter(Boolean)
          : [];

        const childIds = Array.isArray(kaitenData.children_ids)
          ? kaitenData.children_ids
          : Array.isArray(kaitenData.children)
          ? kaitenData.children.map((c: any) => c?.id).filter(Boolean)
          : [];

        return {
          ...base,
          title: kaitenData.title,
          description: kaitenData.description || null,
          space_id: extractedSpaceId,
          board_id: kaitenData.board_id,
          column_id: kaitenData.column_id,
          lane_id: kaitenData.lane_id || null,
          type_id: kaitenData.type_id || null,
          owner_id: kaitenData.owner_id || kaitenData.members?.[0]?.id || null,
          creator_id: kaitenData.creator_id || null,
          state: kaitenData.state || null,
          archived: kaitenData.archived || false,
          blocked: kaitenData.blocked || false,
          size_text: kaitenData.size_text || null,
          due_date: kaitenData.due_date
            ? new Date(kaitenData.due_date).toISOString()
            : null,
          time_spent_sum: kaitenData.time_spent_sum || 0,
          time_blocked_sum: kaitenData.time_blocked_sum || 0,
          estimate_workload: kaitenData.estimate_workload || 0,
          parents_ids: parentIds,
          children_ids: childIds,
          members_ids: membersIds,
          started_at: kaitenData.started_at
            ? new Date(kaitenData.started_at).toISOString()
            : null,
          completed_at: kaitenData.completed_at
            ? new Date(kaitenData.completed_at).toISOString()
            : null,
          properties: kaitenData.properties || {},
          tags_cache: kaitenData.tags || [],
          kaiten_created_at: kaitenData.created
            ? new Date(kaitenData.created).toISOString()
            : null,
          kaiten_updated_at: kaitenData.updated
            ? new Date(kaitenData.updated).toISOString()
            : null,
        };
      }

      case "time_logs":
        return {
          ...base,
          card_id: kaitenData.card_id ?? null,
          user_id: kaitenData.user_id ?? kaitenData.author_id ?? null,
          time_spent_minutes: kaitenData.time_spent ?? 0,
          date: kaitenData.for_date ?? kaitenData.date ?? null,
          comment: kaitenData.comment ?? null,
          role_id: kaitenData.role_id ?? null,
          created_at: kaitenData.created
            ? new Date(kaitenData.created).toISOString()
            : null,
          updated_at: kaitenData.updated
            ? new Date(kaitenData.updated).toISOString()
            : null,
        };

      default:
        return base;
    }
  }

  private resolveDependencies(entities: EntityType[]): EntityType[] {
    const resolved = new Set<EntityType>();

    const visit = (e: EntityType) => {
      if (resolved.has(e)) return;
      resolved.add(e);
      const deps = DEPENDENCY_GRAPH[e] || [];
      deps.forEach(visit);
    };

    entities.forEach(visit);
    return Array.from(resolved);
  }

  private topologicalSort(entities: EntityType[]): EntityType[] {
    const sorted: EntityType[] = [];
    const visited = new Set<EntityType>();

    const visit = (entity: EntityType) => {
      if (visited.has(entity)) return;
      visited.add(entity);

      const deps = DEPENDENCY_GRAPH[entity] || [];
      deps.forEach((dep) => {
        if (entities.includes(dep)) visit(dep);
      });

      sorted.push(entity);
    };

    entities.forEach(visit);
    return sorted;
  }

  // === sync_metadata / sync_logs ===

  private async getSyncMetadata(entityType: EntityType): Promise<any | null> {
    if (!this.supabase) return null;

    // maybeSingle не падает, если строки нет
    const { data, error } = await (this.supabase as any)
      .from("sync_metadata")
      .select("*")
      .eq("entity_type", entityType)
      .maybeSingle();

    if (error) return null;
    return data ?? null;
  }

  private async upsertSyncMetadata(entityType: EntityType, patch: Record<string, any>) {
    if (!this.supabase) return;

    const row = {
      entity_type: entityType,
      updated_at: new Date().toISOString(),
      ...patch,
    };

    await this.supabase
      .from("sync_metadata")
      .upsert(row as any, { onConflict: "entity_type" });
  }

  private async createSyncLog(entityType: EntityType, syncType: string): Promise<number> {
    if (!this.supabase) return 0;

    const { data } = await this.supabase
      .from("sync_logs")
      .insert({
        entity_type: entityType,
        sync_type: syncType,
        status: "started",
      })
      .select("id")
      .single();

    return data?.id || 0;
  }

  private async completeSyncLog(logId: number, stats: any, durationMs: number) {
    if (!this.supabase || !logId) return;

    await this.supabase
      .from("sync_logs")
      .update({
        status: "completed",
        ...stats,
        completed_at: new Date().toISOString(),
        duration_ms: durationMs,
      })
      .eq("id", logId);
  }

  private async failSyncLog(logId: number, errorMessage: string, durationMs: number) {
    if (!this.supabase || !logId) return;

    await this.supabase
      .from("sync_logs")
      .update({
        status: "failed",
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
        duration_ms: durationMs,
      })
      .eq("id", logId);
  }
}

export const syncOrchestrator = new SyncOrchestrator();
