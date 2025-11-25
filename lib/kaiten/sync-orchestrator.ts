/**
 * Sync Orchestrator
 * Синхронизация данных из Kaiten в Supabase
 * Поддерживает инкрементальный синк и обработку тайм-логов
 */

import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { kaitenClient, kaitenUtils } from "./client";
import { debugLogger } from "@/lib/debug-logger";

/**
 * Тип сущностей, которые можем синхронизировать
 */
export type EntityType =
  | 'spaces'
  | 'boards'
  | 'columns'
  | 'lanes'
  | 'users'
  | 'card_types'
  | 'property_definitions'
  | 'tags'
  | 'cards'
  | 'time_logs';

/**
 * Граф зависимостей: какие сущности должны быть синхронизированы до текущей
 */
const DEPENDENCY_GRAPH: Record<EntityType, EntityType[]> = {
  spaces: [],
  users: [],
  card_types: [],
  property_definitions: [],
  tags: [],
  boards: ['spaces', 'users'],
  columns: ['boards'],
  lanes: ['boards'],
  cards: ['boards', 'columns', 'lanes', 'users', 'card_types'],
  time_logs: ['cards', 'users'],
};

/**
 * Результат синхронизации одной сущности
 */
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

/**
 * Опции синхронизации
 */
export interface SyncOptions {
  /**
   * Список сущностей для синхронизации. Если не указан – синхронизуются все.
   */
  entityTypes?: EntityType[];
  /**
   * Включает инкрементальный режим: только изменённые с момента последней синхронизации записи.
   */
  incremental?: boolean;
  /**
   * Автоматически подтягивать зависимости для указанных сущностей.
   */
  resolveDependencies?: boolean;
  /**
   * Дата начала диапазона выгрузки тайм‑логов в формате «YYYY-MM-DD». Если указано, перекрывает `updated_since`.
   */
  timeLogsFrom?: string;
  /**
   * Дата конца диапазона выгрузки тайм‑логов в формате «YYYY-MM-DD». Если не указано, для тайм‑логов используется текущая дата.
   */
  timeLogsTo?: string;
}

/**
 * Основной класс для синхронизации данных
 */
export class SyncOrchestrator {
  private supabase = getServiceSupabaseClient();

  /**
   * Запускает синхронизацию. Можно указать подмножество сущностей,
   * использовать инкрементальный режим и автоматическое разрешение зависимостей.
   */
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

    // Определяем, какие сущности будем синхронизировать
    let entitiesToSync: EntityType[] = entityTypes || (Object.keys(DEPENDENCY_GRAPH) as EntityType[]);

    // Подключаем зависимости, если нужно
    if (resolveDependencies) {
      entitiesToSync = this.resolveDependencies(entitiesToSync);
    }

    // Сортируем по зависимостям
    const sortedEntities = this.topologicalSort(entitiesToSync);
    console.log(`📋 [Sync] Execution Order:`, sortedEntities.join(' -> '));

    const results: SyncResult[] = [];

    for (const entityType of sortedEntities) {
      console.log(`▶️ [Sync] Processing: ${entityType}...`);
      try {
        // Передаём в syncEntity полный объект options, чтобы тайм‑логи могли использовать диапазон
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

        // Останавливаем синхронизацию при критической ошибке в базовых сущностях
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

  /**
   * Синхронизация одной сущности
   */
  private async syncEntity(
    entityType: EntityType,
    opts: { incremental: boolean; timeLogsFrom?: string; timeLogsTo?: string }
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const { incremental, timeLogsFrom, timeLogsTo } = opts;
    const logId = await this.createSyncLog(entityType, incremental ? 'incremental' : 'full');

    try {
      // Получаем время последней инкрементальной синхронизации
      const metadata = await this.getSyncMetadata(entityType);
      const updatedSince: string | undefined =
        incremental && metadata?.last_incremental_sync_at
          ? metadata.last_incremental_sync_at
          : undefined;

      // Подготавливаем параметры для запроса данных
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

      // Запрашиваем данные из Kaiten
      const kaitenData = await this.fetchFromKaiten(entityType, fetchParams);
      console.log(`📦 [${entityType}] Received ${kaitenData.length} items.`);
      await debugLogger.info(`Received ${kaitenData.length} ${entityType} items`, entityType, { count: kaitenData.length });

      console.log(`💾 [${entityType}] Starting transformation and upsert to DB...`);
      await debugLogger.info(`Starting upsert ${kaitenData.length} ${entityType} to DB`, entityType);

      // Выполняем upsert в базу
      const stats = await this.upsertToDatabase(entityType, kaitenData);
      console.log(`✨ [${entityType}] Upsert completed successfully.`);
      await debugLogger.info(`Upsert completed for ${entityType}`, entityType, {
        processed: stats.records_processed,
        total: stats.total
      });

      // Обновляем метаданные синхронизации
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

  /**
   * Обращается к Kaiten API в зависимости от типа сущности
   * ВАЖНО: Убран limit: 1000, так как API Kaiten ограничивает ответ 100 записями,
   * и это ломает логику пагинации (received < requested).
   */
  private async fetchFromKaiten(entityType: EntityType, params?: any): Promise<any[]> {
    const baseParams = { ...params }; // limit: 100 (по умолчанию в client.ts)
    
    switch (entityType) {
      case 'spaces': return kaitenClient.getSpaces(baseParams);
      case 'boards': return kaitenClient.getBoards();
      case 'columns': return kaitenClient.getColumns();
      case 'lanes': return kaitenClient.getLanes();
      case 'users': return kaitenClient.getUsers(baseParams);
      case 'card_types': return kaitenClient.getCardTypes();
      case 'property_definitions': return kaitenClient.getPropertyDefinitions();
      case 'tags': return kaitenClient.getTags();
      
      case 'time_logs': 
        return kaitenClient.getTimeLogs(baseParams);
      case 'cards': 
        return kaitenClient.getCards(baseParams);
        
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }
  }

  /**
   * Выполняет пакетный upsert в Supabase
   */
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

    // Преобразуем данные в формат базы
    console.log(`🔄 [${entityType}] Transforming ${data.length} items...`);
    const dbRows = await Promise.all(
      data.map(async (item) => await this.transformToDbFormat(entityType, item))
    );
    console.log(`✓ [${entityType}] Transformation complete. Got ${dbRows.length} rows.`);

    // Upsert батчами
    const batchSize = 1000;
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

  /**
   * Преобразует полученные данные из Kaiten в формат базы Supabase.
   */
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
          parents_ids: finalParentIds,
          children_ids: finalChildIds,
          members_ids: membersIds,
          estimate_workload: kaitenData.estimate_workload || 0,
          kaiten_created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          kaiten_updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
        };
      }

      case 'spaces':
        return {
          ...base,
          title: kaitenData.title,
          company_id: kaitenData.company_id || null,
          owner_user_id: kaitenData.owner_user_id || null,
          archived: kaitenData.archived || false,
          sort_order: kaitenData.sort_order || null,
          kaiten_created_at: kaitenData.created ? kaitenData.created : null,
          kaiten_updated_at: kaitenData.updated ? kaitenData.updated : null,
        };
      case 'boards':
        return {
          ...base,
          space_id: kaitenData.space_id,
          title: kaitenData.title,
          description: kaitenData.description || null,
          board_type: kaitenData.board_type || null,
          archived: kaitenData.archived || false,
          sort_order: kaitenData.sort_order || null,
          kaiten_created_at: kaitenData.created ? kaitenData.created : null,
          kaiten_updated_at: kaitenData.updated ? kaitenData.updated : null,
        };
      case 'columns':
        return {
          ...base,
          title: kaitenData.title,
          board_id: kaitenData.board_id,
          column_type: kaitenData.type,
          sort_order: kaitenData.sort_order ?? kaitenData.order ?? null,
          wip_limit: kaitenData.wip_limit || null,
          archived: kaitenData.archived || false,
          kaiten_created_at: kaitenData.created || null,
          kaiten_updated_at: kaitenData.updated || null,
        };
      case 'lanes':
        return {
          ...base,
          title: kaitenData.title,
          board_id: kaitenData.board_id,
          sort_order: kaitenData.sort_order ?? kaitenData.order ?? null,
          archived: kaitenData.archived || false,
          kaiten_created_at: kaitenData.created || null,
          kaiten_updated_at: kaitenData.updated || null,
        };
      case 'users':
        return {
          ...base,
          full_name: kaitenData.full_name || null,
          email: kaitenData.email || null,
          username: kaitenData.username || null,
          timezone: kaitenData.timezone || null,
          role: kaitenData.role || null,
          is_admin: kaitenData.is_admin || false,
          take_licence: kaitenData.take_licence || null,
          apps_permissions: kaitenData.apps_permissions || null,
          locked: kaitenData.locked || null,
          last_request_date: kaitenData.last_request_date || null,
          kaiten_created_at: kaitenData.created || null,
          kaiten_updated_at: kaitenData.updated || null,
        };
      case 'card_types':
        return {
          ...base,
          name: kaitenData.name,
          icon_url: kaitenData.icon_url || null,
          kaiten_created_at: kaitenData.created || null,
          kaiten_updated_at: kaitenData.updated || null,
        };
      case 'tags':
        return {
          ...base,
          name: kaitenData.name,
          color: kaitenData.color || null,
          group_name: kaitenData.group_name || null,
          kaiten_created_at: kaitenData.created || null,
          kaiten_updated_at: kaitenData.updated || null,
        };
      case 'property_definitions':
        return {
          ...base,
          name: kaitenData.name || 'Untitled',
          field_type: kaitenData.type || null,
          select_options: kaitenData.select_options || null,
          kaiten_created_at: kaitenData.created || null,
          kaiten_updated_at: kaitenData.updated || null,
        };
      case 'time_logs': {
        const slimPayload: any = { ...kaitenData };
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
      default:
        console.warn(`No transformer for entity type ${entityType}`);
        return { ...base };
    }
  }

  /**
   * Разрешает зависимости для заданного списка сущностей
   */
  private resolveDependencies(entities: EntityType[]): EntityType[] {
    const resolved = new Set<EntityType>(entities);
    entities.forEach((entity) => {
      const deps = DEPENDENCY_GRAPH[entity] || [];
      deps.forEach((dep) => resolved.add(dep));
    });
    return Array.from(resolved);
  }

  /**
   * Топологическая сортировка сущностей по зависимостям
   */
  private topologicalSort(entities: EntityType[]): EntityType[] {
    const sorted: EntityType[] = [];
    const visited = new Set<EntityType>();
    const visit = (entity: EntityType) => {
      if (visited.has(entity)) return;
      visited.add(entity);
      const deps = DEPENDENCY_GRAPH[entity] || [];
      deps.forEach((dep) => {
        if (entities.includes(dep)) {
          visit(dep);
        }
      });
      sorted.push(entity);
    };
    entities.forEach(visit);
    return sorted;
  }

  /**
   * Получает метаданные последней синхронизации из базы
   */
  private async getSyncMetadata(entityType: EntityType): Promise<any> {
    if (!this.supabase) return null;
    const { data } = await this.supabase
      .from('sync_metadata')
      .select('*')
      .eq('entity_type', entityType)
      .single();
    return data;
  }

  /**
   * Обновляет метаданные синхронизации в базе.
   * * FIX: Теперь мы запрашиваем реальное количество записей (count) из таблицы,
   * вместо использования batchCount. Это решает проблему параллельной синхронизации,
   * когда частичное обновление (один месяц) перезаписывало total_records своим значением.
   */
  private async updateSyncMetadata(entityType: EntityType, incremental: boolean, _batchCount: number): Promise<void> {
    if (!this.supabase) return;

    // 1. Получаем АКТУАЛЬНОЕ количество записей в таблице
    // Используем head: true и count: 'exact', чтобы не тянуть данные, а только посчитать
    const { count, error: countError } = await this.supabase
      .schema('kaiten')
      .from(entityType)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error(`⚠️ [${entityType}] Failed to count total records:`, countError);
    }

    // 2. Записываем в метаданные реальный total из базы
    const record: any = {
      entity_type: entityType,
      status: 'idle',
      error_message: null,
      total_records: count ?? _batchCount, // Если count не удалось получить, используем старое поведение
    };

    if (incremental) {
      record.last_incremental_sync_at = new Date().toISOString();
    } else {
      record.last_full_sync_at = new Date().toISOString();
    }

    const { error } = await this.supabase
      .from('sync_metadata')
      .upsert(record, { onConflict: 'entity_type' });

    if (error) {
      console.error(`⚠️ [${entityType}] Failed to update sync_metadata:`, error);
    }
  }

  /**
   * Создает запись в журнале синхронизации
   */
  private async createSyncLog(entityType: EntityType, syncType: string): Promise<number> {
    if (!this.supabase) return 0;
    const { data, error } = await this.supabase
      .from('sync_logs')
      .insert({ entity_type: entityType, sync_type: syncType, status: 'started' })
      .select('id')
      .single();

    if (error) {
      console.error(`⚠️ [${entityType}] Failed to create sync_log:`, error);
      return 0;
    }
    return data?.id || 0;
  }

  /**
   * Обновляет запись в журнале синхронизации при успешном завершении
   */
  private async completeSyncLog(logId: number, stats: any, durationMs: number): Promise<void> {
    if (!this.supabase || !logId) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { total, ...statsWithoutTotal } = stats;

    const { error } = await this.supabase
      .from('sync_logs')
      .update({
        status: 'completed',
        ...statsWithoutTotal,
        completed_at: new Date().toISOString(),
        duration_ms: durationMs,
      })
      .eq('id', logId);

    if (error) {
      console.error(`⚠️ [Log ${logId}] Failed to complete sync_log:`, error);
    }
  }

  /**
   * Обновляет запись в журнале синхронизации при ошибке
   */
  private async failSyncLog(logId: number, errorMessage: string, durationMs: number): Promise<void> {
    if (!this.supabase || !logId) return;
    console.error(`💾 [DB Log] Writing failure for log ${logId}: ${errorMessage}`);
    const { error } = await this.supabase
      .from('sync_logs')
      .update({
        status: 'failed',
        error_message: errorMessage?.substring(0, 1000),
        completed_at: new Date().toISOString(),
        duration_ms: durationMs,
      })
      .eq('id', logId);

    if (error) {
      console.error(`⚠️ [Log ${logId}] Failed to write failure to sync_log:`, error);
    }
  }
}

export const syncOrchestrator = new SyncOrchestrator();