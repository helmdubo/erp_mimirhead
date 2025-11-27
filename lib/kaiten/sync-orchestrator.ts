/**
 * Sync Orchestrator (FINAL WITH ROLES)
 * Управляет синхронизацией данных с Kaiten, разрешает зависимости
 */

import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { kaitenClient, kaitenUtils } from "./client";
import { debugLogger } from "@/lib/debug-logger";
import { EntityType } from "./types";

/**
 * Граф зависимостей: какие сущности нужно синхронизировать перед другими
 */
const DEPENDENCY_GRAPH: Record<EntityType, EntityType[]> = {
  spaces: [],
  users: [],
  card_types: [],
  property_definitions: [],
  tags: [],
  roles: [], // 🔥 ДОБАВЛЕНО: Роли независимы
  boards: ['spaces', 'users'],
  columns: ['boards'],
  lanes: ['boards'],
  cards: ['boards', 'columns', 'lanes', 'users', 'card_types', 'tags'],
  time_logs: ['users', 'cards'],
};

export interface SyncResult {
  entity_type: EntityType;
  success: boolean;
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_skipped: number;
  error?: string;
  duration_ms: number;
}

export interface SyncOptions {
  entityTypes?: EntityType[];
  incremental?: boolean;
  resolveDependencies?: boolean;
  timeLogsFrom?: string;
  timeLogsTo?: string;
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

    console.log(`🚀 [Sync] Started. Entities: ${entityTypes?.join(', ') || 'ALL'}. Deps: ${resolveDependencies}`);

    if (!this.supabase) {
      console.error("❌ [Sync] Supabase client missing");
      throw new Error("Supabase client not available");
    }

    let entitiesToSync = entityTypes || (Object.keys(DEPENDENCY_GRAPH) as EntityType[]);

    if (resolveDependencies) {
      entitiesToSync = this.resolveDependencies(entitiesToSync);
    }

    const sortedEntities = this.topologicalSort(entitiesToSync);
    console.log(`📋 [Sync] Execution Order:`, sortedEntities.join(' -> '));

    const results: SyncResult[] = [];

    for (const entityType of sortedEntities) {
      console.log(`▶️ [Sync] Processing: ${entityType}...`);
      try {
        const result = await this.syncEntity(entityType, {
          incremental,
          timeLogsFrom,
          timeLogsTo,
        });

        results.push(result);

        if (result.success) {
          console.log(`✅ [Sync] ${entityType} Done. Processed: ${result.records_processed}`);
        } else {
          console.error(`❌ [Sync] ${entityType} FAILED: ${result.error}`);
        }

        if (!result.success && ['spaces', 'boards', 'columns', 'lanes'].includes(entityType)) {
          console.error(`⛔ [Sync] Critical failure in ${entityType}. Aborting sequence.`);
          break;
        }
      } catch (error: any) {
        console.error(`🔥 [Sync] CRASH in ${entityType}:`, error);
        results.push({
          entity_type: entityType,
          success: false,
          records_processed: 0,
          records_created: 0,
          records_updated: 0,
          records_skipped: 0,
          error: error?.message || "Unknown crash",
          duration_ms: 0,
        });
      }
    }

    console.log(`🏁 [Sync] Sequence finished.`);
    return results;
  }

  private async syncEntity(
    entityType: EntityType,
    opts: { incremental: boolean; timeLogsFrom?: string; timeLogsTo?: string }
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const { incremental, timeLogsFrom, timeLogsTo } = opts;
    const logId = await this.createSyncLog(entityType, incremental ? 'incremental' : 'full');

    try {
      const metadata = await this.getSyncMetadata(entityType);
      const updatedSince: string | undefined =
        incremental && metadata?.last_incremental_sync_at
          ? metadata.last_incremental_sync_at
          : undefined;

      const fetchParams: any = {};
      
      if (entityType === 'time_logs') {
        const fromParam =
          timeLogsFrom ||
          (updatedSince
            ? (() => {
                const d = new Date(updatedSince);
                if (!isNaN(d.getTime())) {
                  return d.toISOString().slice(0, 10);
                }
                const parts = updatedSince.split('T');
                return parts.length > 0 ? parts[0] : undefined;
              })()
            : undefined);
        const toParam = timeLogsTo || new Date().toISOString().slice(0, 10);
        if (fromParam) fetchParams.from = fromParam;
        if (toParam) fetchParams.to = toParam;
      } else {
        if (updatedSince) {
          fetchParams.updated_since = updatedSince;
        }
      }

      console.log(`📡 [${entityType}] Fetching from Kaiten with params:`, fetchParams);
      await debugLogger.info(`Fetching ${entityType} from Kaiten`, entityType, { params: fetchParams });

      const kaitenData = await this.fetchFromKaiten(entityType, fetchParams);
      console.log(`📦 [${entityType}] Received ${kaitenData.length} items.`);
      await debugLogger.info(`Received ${kaitenData.length} ${entityType} items`, entityType, { count: kaitenData.length });

      console.log(`💾 [${entityType}] Starting transformation and upsert to DB...`);
      await debugLogger.info(`Starting upsert ${kaitenData.length} ${entityType} to DB`, entityType);

      const stats = await this.upsertToDatabase(entityType, kaitenData);
      console.log(`✨ [${entityType}] Upsert completed successfully.`);
      if (entityType === 'users' || entityType === 'roles') {
        await this.syncEmployeeKaitenRoles();
      }
      await debugLogger.info(`Upsert completed for ${entityType}`, entityType, {
        processed: stats.records_processed,
        total: stats.total
      });

      await this.updateSyncMetadata(entityType, incremental, stats.total);
      const duration = Date.now() - startTime;
      await this.completeSyncLog(logId, stats, duration);

      return {
        entity_type: entityType,
        success: true,
        ...stats,
        duration_ms: duration,
      };
    } catch (error: any) {
      console.error(`💀 [${entityType}] Error in syncEntity:`, error);
      await debugLogger.error(`Error in syncEntity for ${entityType}: ${error.message}`, entityType, {
        error: error.message,
        stack: error.stack
      });
      const duration = Date.now() - startTime;
      await this.failSyncLog(logId, error.message, duration);
      return {
        entity_type: entityType,
        success: false,
        records_processed: 0,
        records_created: 0,
        records_updated: 0,
        records_skipped: 0,
        error: error.message,
        duration_ms: duration,
      };
    }
  }

  private async fetchFromKaiten(entityType: EntityType, params?: any): Promise<any[]> {
    const baseParams = { ...params };
    
    switch (entityType) {
      case 'spaces': return kaitenClient.getSpaces(baseParams);
      case 'boards': return kaitenClient.getBoards();
      case 'columns': return kaitenClient.getColumns();
      case 'lanes': return kaitenClient.getLanes();
      case 'users': return kaitenClient.getUsers(baseParams);
      case 'card_types': return kaitenClient.getCardTypes();
      case 'property_definitions': return kaitenClient.getPropertyDefinitions();
      case 'tags': return kaitenClient.getTags();
      case 'time_logs': return kaitenClient.getTimeLogs(baseParams);
      case 'cards': return kaitenClient.getCards(baseParams);
      case 'roles': return kaitenClient.getRoles(); // 🔥 ДОБАВЛЕНО
      default: throw new Error(`Unknown entity type: ${entityType}`);
    }
  }

  private async upsertToDatabase(entityType: EntityType, data: any[]): Promise<{
    total: number;
    records_processed: number;
    records_created: number;
    records_updated: number;
    records_skipped: number;
  }> {
    if (!this.supabase) throw new Error('Supabase not available');

    const stats = {
      total: data.length,
      records_processed: 0,
      records_created: 0,
      records_updated: 0,
      records_skipped: 0,
    };

    console.log(`🔄 [${entityType}] Transforming ${data.length} items...`);
    const dbRows = await Promise.all(
      data.map(async (item) => await this.transformToDbFormat(entityType, item))
    );
    console.log(`✓ [${entityType}] Transformation complete. Got ${dbRows.length} rows.`);

    const batchSize = entityType === 'cards' ? 50 : 1000;

    for (let i = 0; i < dbRows.length; i += batchSize) {
      const batch = dbRows.slice(i, i + batchSize);
      const batchNum = Math.floor(i/batchSize) + 1;
      const totalBatches = Math.ceil(dbRows.length/batchSize);
      console.log(`💾 [${entityType}] Batch ${batchNum}/${totalBatches} (${batch.length} rows) - Starting upsert...`);

      const { error } = await this.supabase
        .schema('kaiten')
        .from(entityType)
        .upsert(batch as any, { onConflict: 'id' });

      if (error) {
        console.error(`❌ [${entityType}] Batch ${batchNum} insert error:`, error);
        await debugLogger.error(`Batch ${batchNum} upsert failed for ${entityType}`, entityType, {
          error: JSON.stringify(error),
          batchSize: batch.length,
          firstItem: batch[0]
        });
        throw error;
      }
      console.log(`✓ [${entityType}] Batch ${batchNum}/${totalBatches} upserted successfully.`);
      stats.records_processed += batch.length;
    }
    console.log(`🎉 [${entityType}] All batches completed. Total processed: ${stats.records_processed}`);
    return stats;
  }

  private async transformToDbFormat(entityType: EntityType, kaitenData: any): Promise<any> {
    const payloadHash = await kaitenUtils.calculatePayloadHash(kaitenData);
    const base: any = {
      id: kaitenData.id,
      uid: kaitenData.uid || null,
      synced_at: new Date().toISOString(),
      payload_hash: payloadHash,
      raw_payload: kaitenData,
    };

    switch (entityType) {
      case 'roles': // 🔥 ДОБАВЛЕНО
        return {
          ...base,
          name: kaitenData.name,
          company_id: kaitenData.company_id,
          created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
        };

      case 'cards': {
        let extractedSpaceId = kaitenData.space_id;
        if (!extractedSpaceId && kaitenData.board?.spaces?.length > 0) {
          extractedSpaceId = kaitenData.board.spaces[0].id;
        }

        let finalParentIds = kaitenData.parents_ids || [];
        let finalChildIds = kaitenData.children_ids || [];
        if (kaitenData.parents && !finalParentIds.length) {
          finalParentIds = kaitenData.parents.map((p: any) => p.id);
        }
        if (kaitenData.children && !finalChildIds.length) {
          finalChildIds = kaitenData.children.map((c: any) => c.id);
        }

        const membersIds = Array.isArray(kaitenData.members)
          ? kaitenData.members.map((m: any) => m.id)
          : [];

        return {
          ...base,
          title: kaitenData.title,
          description: kaitenData.description || null,
          space_id: extractedSpaceId || null,
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
          due_date: kaitenData.due_date ? new Date(kaitenData.due_date).toISOString() : null,
          time_spent_sum: kaitenData.time_spent_sum || 0,
          time_blocked_sum: kaitenData.time_blocked_sum || 0,
          started_at: kaitenData.started_at ? new Date(kaitenData.started_at).toISOString() : null,
          completed_at: kaitenData.completed_at ? new Date(kaitenData.completed_at).toISOString() : null,
          properties: kaitenData.properties || {},
          tags_cache: kaitenData.tags || [],
          members_data: kaitenData.members || [],
          parents_ids: finalParentIds,
          children_ids: finalChildIds,
          members_ids: membersIds,
          estimate_workload: kaitenData.estimate_workload || 0,
          kaiten_created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          kaiten_updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
          external_id: kaitenData.external_id || null, // 🔥 ДОБАВЛЕНО
        };
      }

      case 'time_logs': {
        const slimPayload = { ...kaitenData };
        delete slimPayload.card;
        delete slimPayload.user;
        delete slimPayload.owner;
        delete slimPayload.author;
        delete slimPayload.role;
        delete slimPayload.tags;
        delete slimPayload.board;
        delete slimPayload.lane;
        delete slimPayload.column;
        delete slimPayload.parents;
        delete slimPayload.children;

        return {
          ...base,
          raw_payload: slimPayload,
          card_id: kaitenData.card_id ?? kaitenData.card?.id ?? null,
          user_id:
            kaitenData.user_id ??
            kaitenData.author_id ??
            (kaitenData.author && kaitenData.author.id) ??
            (kaitenData.user && kaitenData.user.id) ??
            null,
          role_id:
            kaitenData.role_id ??
            (kaitenData.role && kaitenData.role.id) ??
            null,
          time_spent_minutes:
            kaitenData.time_spent_minutes ?? kaitenData.time_spent ?? 0,
          date: kaitenData.date ?? kaitenData.for_date ?? null,
          comment: kaitenData.comment || null,
          created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
        };
      }

      case 'spaces': return { ...base, title: kaitenData.title, company_id: kaitenData.company_id || null, owner_user_id: kaitenData.owner_user_id || null, archived: kaitenData.archived || false, sort_order: kaitenData.sort_order || null, kaiten_created_at: kaitenData.created ? kaitenData.created : null, kaiten_updated_at: kaitenData.updated ? kaitenData.updated : null };
      case 'boards': return { ...base, space_id: kaitenData.space_id, title: kaitenData.title, description: kaitenData.description || null, board_type: kaitenData.board_type || null, archived: kaitenData.archived || false, sort_order: kaitenData.sort_order || null, kaiten_created_at: kaitenData.created ? kaitenData.created : null, kaiten_updated_at: kaitenData.updated ? kaitenData.updated : null };
      case 'columns': return { ...base, title: kaitenData.title, board_id: kaitenData.board_id, column_type: kaitenData.type, sort_order: kaitenData.sort_order ?? kaitenData.order ?? null, wip_limit: kaitenData.wip_limit || null, archived: kaitenData.archived || false, kaiten_created_at: kaitenData.created || null, kaiten_updated_at: kaitenData.updated || null };
      case 'lanes': return { ...base, title: kaitenData.title, board_id: kaitenData.board_id, sort_order: kaitenData.sort_order ?? kaitenData.order ?? null, archived: kaitenData.archived || false, kaiten_created_at: kaitenData.created || null, kaiten_updated_at: kaitenData.updated || null };
      case 'users': return { ...base, full_name: kaitenData.full_name || null, email: kaitenData.email || null, username: kaitenData.username || null, timezone: kaitenData.timezone || null, role: kaitenData.role || null, is_admin: kaitenData.is_admin || false, take_licence: kaitenData.take_licence || null, apps_permissions: kaitenData.apps_permissions || null, locked: kaitenData.locked || null, last_request_date: kaitenData.last_request_date || null, kaiten_created_at: kaitenData.created || null, kaiten_updated_at: kaitenData.updated || null };
      case 'card_types': return { ...base, name: kaitenData.name, icon_url: kaitenData.icon_url || null, kaiten_created_at: kaitenData.created || null, kaiten_updated_at: kaitenData.updated || null };
      case 'tags': return { ...base, name: kaitenData.name, color: kaitenData.color || null, group_name: kaitenData.group_name || null, kaiten_created_at: kaitenData.created || null, kaiten_updated_at: kaitenData.updated || null };
      case 'property_definitions': return { ...base, name: kaitenData.name || 'Untitled', field_type: kaitenData.type || null, select_options: kaitenData.select_options || null, kaiten_created_at: kaitenData.created || null, kaiten_updated_at: kaitenData.updated || null };
      
      default:
        console.warn(`No transformer for entity type ${entityType}`);
        return { ...base };
    }
  }

  private async syncEmployeeKaitenRoles(): Promise<void> {
    if (!this.supabase) throw new Error('Supabase not available');

    console.log("🔄 [employees] Syncing Kaiten role mappings onto ops.employees...");
    const { data, error } = await this.supabase.rpc('sync_employee_kaiten_roles');

    if (error) {
      console.error("❌ [employees] Failed to refresh kaiten_role_id", error);
      await debugLogger.error("Failed to refresh kaiten_role_id on employees", 'employees', {
        error: error.message,
        details: error,
      });
      throw new Error(error.message);
    }

    const updatedCount = Array.isArray(data) && data[0]?.updated_count ? Number(data[0].updated_count) : 0;
    console.log(`👥 [employees] kaiten_role_id refreshed for ${updatedCount} employees.`);
  }

  private resolveDependencies(entities: EntityType[]): EntityType[] {
    const resolved = new Set<EntityType>(entities);
    entities.forEach((entity) => {
      const deps = DEPENDENCY_GRAPH[entity] || [];
      deps.forEach((dep) => resolved.add(dep));
    });
    return Array.from(resolved);
  }

  private topologicalSort(entities: EntityType[]): EntityType[] {
    const sorted: EntityType[] = [];
    const visited = new Set<EntityType>();
    const visit = (entity: EntityType) => {
      if (visited.has(entity)) return;
      visited.add(entity);
      const deps = DEPENDENCY_GRAPH[entity] || [];
      deps.forEach((dep) => { if (entities.includes(dep)) visit(dep); });
      sorted.push(entity);
    };
    entities.forEach(visit);
    return sorted;
  }

  private async getSyncMetadata(entityType: EntityType): Promise<any> {
    if (!this.supabase) return null;
    const { data } = await this.supabase.from('sync_metadata').select('*').eq('entity_type', entityType).single();
    return data;
  }

  private async updateSyncMetadata(entityType: EntityType, incremental: boolean, _batchCount: number): Promise<void> {
    if (!this.supabase) return;
    const { count } = await this.supabase.schema('kaiten').from(entityType).select('*', { count: 'exact', head: true });
    const record: any = { entity_type: entityType, status: 'idle', error_message: null, total_records: count ?? _batchCount };
    if (incremental) record.last_incremental_sync_at = new Date().toISOString(); else record.last_full_sync_at = new Date().toISOString();
    await this.supabase.from('sync_metadata').upsert(record, { onConflict: 'entity_type' });
  }

  private async createSyncLog(entityType: EntityType, syncType: string): Promise<number> {
    if (!this.supabase) return 0;
    const { data } = await this.supabase.from('sync_logs').insert({ entity_type: entityType, sync_type: syncType, status: 'started' }).select('id').single();
    return data?.id || 0;
  }

  private async completeSyncLog(logId: number, stats: any, durationMs: number): Promise<void> {
    if (!this.supabase || !logId) return;
    const statsToSave = { ...stats };
    delete statsToSave.total;
    await this.supabase.from('sync_logs').update({
      status: 'completed',
      ...statsToSave,
      completed_at: new Date().toISOString(),
      duration_ms: durationMs,
    }).eq('id', logId);
  }

  private async failSyncLog(logId: number, errorMessage: string, durationMs: number): Promise<void> {
    if (!this.supabase || !logId) return;
    await this.supabase.from('sync_logs').update({ status: 'failed', error_message: errorMessage?.substring(0, 1000), completed_at: new Date().toISOString(), duration_ms: durationMs }).eq('id', logId);
  }
}

export const syncOrchestrator = new SyncOrchestrator();