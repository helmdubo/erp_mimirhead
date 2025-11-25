/**
 * Sync Orchestrator (SIMPLIFIED & ROBUST)
 * Упрощенная версия: всё храним в массивах внутри карточки.
 * Максимальная надежность извлечения данных.
 */

import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { kaitenClient, kaitenUtils } from "./client";

type EntityType = 'spaces' | 'boards' | 'columns' | 'lanes' | 'users' | 'card_types' | 'property_definitions' | 'tags' | 'cards' | 'time_logs';

const DEPENDENCY_GRAPH: Record<EntityType, EntityType[]> = {
  spaces: [],
  users: [],
  card_types: [],
  property_definitions: [],
  tags: [],
  boards: ['spaces', 'users'],
  columns: ['boards'],
  lanes: ['boards'],
  cards: ['boards', 'columns', 'lanes', 'users', 'card_types'], // Убрали tags из зависимостей
  time_logs: ['cards', 'users'],
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
}

export class SyncOrchestrator {
  private supabase = getServiceSupabaseClient();

  async sync(options: SyncOptions = {}): Promise<SyncResult[]> {
    const {
      entityTypes,
      incremental = false,
      resolveDependencies = true,
    } = options;

    if (!this.supabase) throw new Error("Supabase client not available");

    let entitiesToSync = entityTypes || Object.keys(DEPENDENCY_GRAPH) as EntityType[];
    if (resolveDependencies) {
      entitiesToSync = this.resolveDependencies(entitiesToSync);
    }

    const sortedEntities = this.topologicalSort(entitiesToSync);
    console.log(`Starting sync for entities:`, sortedEntities.join(', '));

    const results: SyncResult[] = [];

    for (const entityType of sortedEntities) {
      try {
        const result = await this.syncEntity(entityType, incremental);
        results.push(result);
        // Критические ошибки структуры
        if (!result.success && ['spaces', 'boards', 'columns', 'lanes'].includes(entityType)) {
            console.error(`⛔ Critical entity ${entityType} failed. Stopping sync to prevent data corruption.`);
            break;
        }
      } catch (error: any) {
        results.push({
          entity_type: entityType,
          success: false,
          records_processed: 0,
          records_created: 0,
          records_updated: 0,
          records_skipped: 0,
          error: error.message,
          duration_ms: 0,
        });
      }
    }
    return results;
  }

  private async syncEntity(entityType: EntityType, incremental: boolean): Promise<SyncResult> {
    const startTime = Date.now();
    const logId = await this.createSyncLog(entityType, incremental ? 'incremental' : 'full');

    try {
      const metadata = await this.getSyncMetadata(entityType);
      const updatedSince = incremental && metadata?.last_incremental_sync_at
        ? metadata.last_incremental_sync_at
        : undefined;

      // 1. Получаем данные
      const kaitenData = await this.fetchFromKaiten(entityType, { updated_since: updatedSince });
      
      // 2. Пишем в базу (сразу с правильными полями)
      const stats = await this.upsertToDatabase(entityType, kaitenData);

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
    switch (entityType) {
      case 'spaces': return kaitenClient.getSpaces(params);
      case 'boards': return kaitenClient.getBoards(); 
      case 'columns': return kaitenClient.getColumns();
      case 'lanes': return kaitenClient.getLanes();
      case 'users': return kaitenClient.getUsers(params);
      case 'card_types': return kaitenClient.getCardTypes();
      case 'property_definitions': return kaitenClient.getPropertyDefinitions();
      case 'tags': return kaitenClient.getTags();
      case 'time_logs':
        return kaitenClient.getTimeLogs(params);
      case 'cards': return kaitenClient.getCards(params);
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
    if (!this.supabase) throw new Error("Supabase not available");

    const stats = {
      total: data.length,
      records_processed: 0,
      records_created: 0,
      records_updated: 0,
      records_skipped: 0,
    };

    // 1. Трансформация (извлекаем ID участников, детей, родителей здесь)
    const dbRows = await Promise.all(
      data.map(async (item) => await this.transformToDbFormat(entityType, item))
    );

    // 2. Batch upsert
    const batchSize = 100;
    for (let i = 0; i < dbRows.length; i += batchSize) {
      const batch = dbRows.slice(i, i + batchSize);
      const { error } = await this.supabase
        .schema('kaiten')
        .from(entityType)
        .upsert(batch as any, { onConflict: 'id' });

      if (error) throw error;
      stats.records_processed += batch.length;
    }
    
    // Мы убрали syncCardTags и syncCardMembers — теперь всё делает upsert выше

    return stats;
  }

  private async transformToDbFormat(entityType: EntityType, kaitenData: any): Promise<any> {
    const payloadHash = await kaitenUtils.calculatePayloadHash(kaitenData);
    const base = {
      id: kaitenData.id,
      uid: kaitenData.uid || null,
      synced_at: new Date().toISOString(),
      payload_hash: payloadHash,
      raw_payload: kaitenData,
    };

    switch (entityType) {
      case 'cards':
        // 1. Space ID Fallback
        let extractedSpaceId = kaitenData.space_id;
        if (!extractedSpaceId && kaitenData.board?.spaces?.length > 0) {
           extractedSpaceId = kaitenData.board.spaces[0].id;
        }

        // 2. Parents & Children extraction (Универсальная логика)
        // Kaiten может присылать id в поле *_ids или в массиве объектов
        let finalParentIds = kaitenData.parents_ids;
        let finalChildIds = kaitenData.children_ids;

        // Если массив пуст или null, но есть массив объектов - берем из объектов
        if ((!finalParentIds || finalParentIds.length === 0) && Array.isArray(kaitenData.parents)) {
            finalParentIds = kaitenData.parents.map((p: any) => p.id);
        }
        if ((!finalChildIds || finalChildIds.length === 0) && Array.isArray(kaitenData.children)) {
            finalChildIds = kaitenData.children.map((c: any) => c.id);
        }

        // 3. Members extraction (Участники)
        // Берем массив ID из объектов участников
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
          
          // 🔥 ЗАПОЛНЯЕМ МАССИВЫ ID
          parents_ids: finalParentIds || [],
          children_ids: finalChildIds || [],
          members_ids: membersIds, 
          estimate_workload: kaitenData.estimate_workload || 0,

          kaiten_created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          kaiten_updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
        };

      // ... Для остальных типов используем стандартный маппинг (копируем из предыдущего файла)
      case 'spaces': return { ...base, title: kaitenData.title, company_id: kaitenData.company_id, owner_user_id: kaitenData.owner_user_id, archived: kaitenData.archived, sort_order: kaitenData.sort_order, kaiten_created_at: kaitenData.created, kaiten_updated_at: kaitenData.updated };
      case 'boards': return { ...base, space_id: kaitenData.space_id, title: kaitenData.title, description: kaitenData.description, board_type: kaitenData.board_type, archived: kaitenData.archived, sort_order: kaitenData.sort_order, kaiten_created_at: kaitenData.created, kaiten_updated_at: kaitenData.updated };
      case 'columns': return { ...base, title: kaitenData.title, board_id: kaitenData.board_id, column_type: kaitenData.type, sort_order: kaitenData.sort_order || kaitenData.order, wip_limit: kaitenData.wip_limit, archived: kaitenData.archived, kaiten_created_at: kaitenData.created, kaiten_updated_at: kaitenData.updated };
      case 'lanes': return { ...base, title: kaitenData.title, board_id: kaitenData.board_id, sort_order: kaitenData.sort_order || kaitenData.order, archived: kaitenData.archived, kaiten_created_at: kaitenData.created, kaiten_updated_at: kaitenData.updated };
      case 'users': return { ...base, full_name: kaitenData.full_name, email: kaitenData.email, username: kaitenData.username, timezone: kaitenData.timezone, role: kaitenData.role, is_admin: kaitenData.is_admin, take_licence: kaitenData.take_licence, apps_permissions: kaitenData.apps_permissions, locked: kaitenData.locked, last_request_date: kaitenData.last_request_date, kaiten_created_at: kaitenData.created, kaiten_updated_at: kaitenData.updated };
      case 'card_types': return { ...base, name: kaitenData.name, icon_url: kaitenData.icon_url, kaiten_created_at: kaitenData.created, kaiten_updated_at: kaitenData.updated };
      case 'tags': return { ...base, name: kaitenData.name, color: kaitenData.color, group_name: kaitenData.group_name, kaiten_created_at: kaitenData.created, kaiten_updated_at: kaitenData.updated };
      case 'property_definitions': return { ...base, name: kaitenData.name || 'Untitled', field_type: kaitenData.type, select_options: kaitenData.select_options, kaiten_created_at: kaitenData.created, kaiten_updated_at: kaitenData.updated };
      case 'time_logs':
        return {
          ...base,
          // Kaiten может возвращать card_id, user_id или вложенные объекты card: {id: ...}
          card_id: kaitenData.card_id || kaitenData.card?.id,
          user_id: kaitenData.user_id || kaitenData.author?.id || kaitenData.user?.id, 
          
          time_spent_minutes: kaitenData.time_spent || 0,
          date: kaitenData.date, // Обычно строка "YYYY-MM-DD"
          comment: kaitenData.comment,
          role_id: kaitenData.role_id,
          
          created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
        };

      default:
        console.warn(`No transformer for entity type ${entityType}`);
        return { ...base };
    }
  }

  // ... Служебные методы (resolveDependencies, topologicalSort и логгирование) оставляем без изменений
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

  private async getSyncMetadata(entityType: EntityType) {
    if (!this.supabase) return null;
    const { data } = await this.supabase.from('sync_metadata').select('*').eq('entity_type', entityType).single();
    return data;
  }

  private async updateSyncMetadata(entityType: EntityType, incremental: boolean, totalRecords: number) {
    if (!this.supabase) return;
    const update: any = { status: 'idle', error_message: null, total_records: totalRecords };
    if (incremental) update.last_incremental_sync_at = new Date().toISOString();
    else update.last_full_sync_at = new Date().toISOString();
    await this.supabase.from('sync_metadata').update(update).eq('entity_type', entityType);
  }

  private async createSyncLog(entityType: EntityType, syncType: string): Promise<number> {
    if (!this.supabase) return 0;
    const { data } = await this.supabase.from('sync_logs').insert({ entity_type: entityType, sync_type: syncType, status: 'started' }).select('id').single();
    return data?.id || 0;
  }

  private async completeSyncLog(logId: number, stats: any, durationMs: number) {
    if (!this.supabase || !logId) return;
    await this.supabase.from('sync_logs').update({ status: 'completed', ...stats, completed_at: new Date().toISOString(), duration_ms: durationMs }).eq('id', logId);
  }

  private async failSyncLog(logId: number, errorMessage: string, durationMs: number) {
    if (!this.supabase || !logId) return;
    await this.supabase.from('sync_logs').update({ status: 'failed', error_message: errorMessage, completed_at: new Date().toISOString(), duration_ms: durationMs }).eq('id', logId);
  }
}

export const syncOrchestrator = new SyncOrchestrator();
