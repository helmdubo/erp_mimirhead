/**
 * Sync Orchestrator
 * Управляет синхронизацией данных с Kaiten, разрешает зависимости
 */

import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { kaitenClient, kaitenUtils } from "./client";
import { EntityType } from "./types";

/**
 * Граф зависимостей: какие сущности нужно синхронизировать перед другими
 */
const DEPENDENCY_GRAPH: Record<EntityType, EntityType[]> = {
  spaces: [],                    // Нет зависимостей
  users: [],                     // Нет зависимостей
  card_types: [],                // Нет зависимостей
  property_definitions: [],      // Нет зависимостей
  tags: [],                      // Нет зависимостей
  boards: ['spaces', 'users'],   // Зависят от spaces и users (owner)
  columns: ['boards'],           // Зависят от boards
  lanes: ['boards'],             // Зависят от boards
  cards: ['boards', 'columns', 'lanes', 'users', 'card_types', 'tags'],  // Зависят от всех
  time_logs: ['users', 'cards'], // Зависят от юзеров и карточек
};

/**
 * Результат синхронизации одной сущности
 */
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

/**
 * Опции для синхронизации
 */
interface SyncOptions {
  entityTypes?: EntityType[];     // Какие сущности синхронизировать (если не указано - все)
  incremental?: boolean;          // true = только измененные с последней синхронизации
  resolveDependencies?: boolean;  // true = автоматически подтянуть зависимости
}

/**
 * Класс для управления синхронизацией
 */
export class SyncOrchestrator {
  private supabase = getServiceSupabaseClient();

  /**
   * Главная функция синхронизации
   */
  async sync(options: SyncOptions = {}): Promise<SyncResult[]> {
    const {
      entityTypes,
      incremental = false,
      resolveDependencies = true,
    } = options;

    if (!this.supabase) {
      throw new Error("Supabase client not available");
    }

    // Определяем какие сущности синхронизировать
    let entitiesToSync = entityTypes || Object.keys(DEPENDENCY_GRAPH) as EntityType[];

    // Разрешаем зависимости
    if (resolveDependencies) {
      entitiesToSync = this.resolveDependencies(entitiesToSync);
    }

    // Топологическая сортировка (синхронизируем в правильном порядке)
    const sortedEntities = this.topologicalSort(entitiesToSync);

    console.log(`Starting sync for entities:`, sortedEntities.join(', '));

    const results: SyncResult[] = [];

    // Синхронизируем последовательно
    for (const entityType of sortedEntities) {
      try {
        const result = await this.syncEntity(entityType, incremental);
        results.push(result);

        // Если критическая сущность провалилась, останавливаем синхронизацию
        if (!result.success && ['spaces', 'boards'].includes(entityType)) {
          console.error(`Critical entity ${entityType} failed, stopping sync`);
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

  /**
   * Синхронизация одной сущности
   */
  private async syncEntity(entityType: EntityType, incremental: boolean): Promise<SyncResult> {
    const startTime = Date.now();

    // Создаем запись в логах
    const logId = await this.createSyncLog(entityType, incremental ? 'incremental' : 'full');

    try {
      // Получаем метаданные последней синхронизации
      const metadata = await this.getSyncMetadata(entityType);

      // Определяем с какого момента синхронизировать
      const updatedSince = incremental && metadata?.last_incremental_sync_at
        ? metadata.last_incremental_sync_at
        : undefined;

      // Формируем параметры запроса
      // ИСПРАВЛЕНО: Используем const вместо let, так как ссылка на объект не меняется
      const fetchParams: any = {};
      
      if (updatedSince) {
        fetchParams.updated_since = updatedSince;
      }

      // Специфика для time_logs: Kaiten API требует from/to
      if (entityType === 'time_logs') {
        // Если инкрементальный синк, берем дату последнего синка как начало
        // Иначе берем "далекое прошлое"
        const fromDate = (incremental && metadata?.last_incremental_sync_at)
          ? new Date(metadata.last_incremental_sync_at).toISOString().split('T')[0] // YYYY-MM-DD
          : "2000-01-01";
          
        const toDate = new Date().toISOString().split('T')[0]; // Сегодня

        fetchParams.from = fromDate;
        fetchParams.to = toDate;
        
        // Удаляем updated_since, так как используем from/to
        delete fetchParams.updated_since;
      }

      console.log(`📥 Fetching ${entityType} with params:`, fetchParams);

      // Получаем данные из Kaiten
      const kaitenData = await this.fetchFromKaiten(entityType, fetchParams);
      
      console.log(`✅ Fetched ${kaitenData.length} records for ${entityType}`);

      // Синхронизируем с БД
      const stats = await this.upsertToDatabase(entityType, kaitenData);

      // Обновляем метаданные
      await this.updateSyncMetadata(entityType, incremental, stats.total);

      const duration = Date.now() - startTime;

      // Завершаем лог
      await this.completeSyncLog(logId, stats, duration);

      return {
        entity_type: entityType,
        success: true,
        ...stats,
        duration_ms: duration,
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`❌ Error syncing ${entityType}:`, error);

      // Логируем ошибку
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
   * Получение данных из Kaiten по типу сущности
   */
  private async fetchFromKaiten(entityType: EntityType, params?: any): Promise<any[]> {
    switch (entityType) {
      case 'spaces':
        return kaitenClient.getSpaces(params);
      // ВАЖНО: boards, columns, lanes не принимают params - они получают всё через перебор родительских сущностей
      case 'boards':
        return kaitenClient.getBoards();
      case 'columns':
        return kaitenClient.getColumns();
      case 'lanes':
        return kaitenClient.getLanes();
      case 'users':
        return kaitenClient.getUsers(params);
      case 'card_types':
        return kaitenClient.getCardTypes();
      case 'property_definitions':
        return kaitenClient.getPropertyDefinitions();
      case 'tags':
        return kaitenClient.getTags();
      case 'cards':
        return kaitenClient.getCards(params);
      case 'time_logs':
        return kaitenClient.getTimeLogs(params);
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }
  }

  /**
   * Сохранение данных в БД с upsert
   */
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

    if (data.length === 0) return stats;

    // Преобразуем данные в формат БД
    console.log(`  🔄 Transforming ${data.length} items...`);
    const dbRows = await Promise.all(
      data.map(async (item) => await this.transformToDbFormat(entityType, item))
    );

    // Batch upsert (по 100 записей за раз чтобы не перегрузить БД)
    const batchSize = 100;
    for (let i = 0; i < dbRows.length; i += batchSize) {
      const batch = dbRows.slice(i, i + batchSize);

      const { error } = await this.supabase
        .schema('kaiten')
        .from(entityType)
        .upsert(batch as any, { onConflict: 'id' });

      if (error) {
        console.error(`Error upserting ${entityType}:`, error);
        throw error;
      }

      stats.records_processed += batch.length;
      // TODO: Различать created vs updated (нужен отдельный запрос)
      stats.records_updated += batch.length;
    }

    return stats;
  }

  /**
   * Преобразование данных Kaiten в формат БД
   */
  private async transformToDbFormat(entityType: EntityType, kaitenData: any): Promise<any> {
    const payloadHash = await kaitenUtils.calculatePayloadHash(kaitenData);

    // Базовые поля для всех сущностей
    const base = {
      id: kaitenData.id,
      uid: kaitenData.uid || null,
      synced_at: new Date().toISOString(),
      payload_hash: payloadHash,
      raw_payload: kaitenData,
    };

    if (entityType === 'time_logs') {
      // ИСПРАВЛЕНО: Игнорируем неиспользуемые переменные, чтобы не падал билд
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {
        card, user, owner, author, role, tags, board, lane, column, parents, children,
        ...cleanedPayload
      } = kaitenData;
      
      // Используем очищенный payload для экономии места
      base.raw_payload = cleanedPayload;
    }

    // Специфичные поля в зависимости от типа
    switch (entityType) {
      case 'spaces':
        return {
          ...base,
          title: kaitenData.title,
          company_id: kaitenData.company_id || null,
          owner_user_id: kaitenData.owner_user_id || null,
          archived: kaitenData.archived || false,
          sort_order: kaitenData.sort_order || null,
          kaiten_created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          kaiten_updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
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
          kaiten_created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          kaiten_updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
        };

      case 'columns':
        return {
          ...base,
          title: kaitenData.title,
          board_id: kaitenData.board_id,
          column_type: kaitenData.type, // В API поле называется type
          sort_order: kaitenData.sort_order || null,
          wip_limit: kaitenData.wip_limit || null,
          archived: kaitenData.archived || false,
          kaiten_created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          kaiten_updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
        };

      case 'lanes':
        return {
          ...base,
          title: kaitenData.title,
          board_id: kaitenData.board_id,
          sort_order: kaitenData.sort_order || null,
          archived: kaitenData.archived || false,
          kaiten_created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          kaiten_updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
        };

      case 'users':
        return {
          ...base,
          full_name: kaitenData.full_name,
          email: kaitenData.email,
          username: kaitenData.username,
          timezone: kaitenData.timezone,
          role: kaitenData.role,
          is_admin: kaitenData.is_admin || false,
          take_licence: kaitenData.take_licence,
          last_request_date: kaitenData.last_request_date ? new Date(kaitenData.last_request_date).toISOString() : null,
          kaiten_created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          kaiten_updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
        };

      case 'card_types':
        return {
          ...base,
          name: kaitenData.name,
          icon_url: kaitenData.icon_url,
          kaiten_created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          kaiten_updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
        };

      case 'property_definitions':
        return {
          ...base,
          name: kaitenData.name || 'Untitled Property', // Защита от null
          field_type: kaitenData.type, // В API поле называется type
          select_options: kaitenData.select_options || null,
          kaiten_created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          kaiten_updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
        };

      case 'tags':
        return {
          ...base,
          name: kaitenData.name,
          color: kaitenData.color,
          group_name: kaitenData.group_name,
          kaiten_created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          kaiten_updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
        };

      case 'cards':
        // Извлечение space_id из вложенного объекта board
        let extractedSpaceId = kaitenData.space_id;
        if (!extractedSpaceId && kaitenData.board && Array.isArray(kaitenData.board.spaces) && kaitenData.board.spaces.length > 0) {
           extractedSpaceId = kaitenData.board.spaces[0].id;
        }

        // Извлечение родителей и детей
        let finalParentIds = kaitenData.parents_ids;
        let finalChildIds = kaitenData.children_ids;

        if (!finalParentIds && Array.isArray(kaitenData.parents)) {
            finalParentIds = kaitenData.parents.map((p: any) => p.id);
        }
        if (!finalChildIds && Array.isArray(kaitenData.children)) {
            finalChildIds = kaitenData.children.map((c: any) => c.id);
        }

        // Извлечение участников
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
          
          // Доп. поля
          estimate_workload: kaitenData.estimate_workload || 0,
          parents_ids: finalParentIds || [],
          children_ids: finalChildIds || [],
          members_ids: membersIds,

          started_at: kaitenData.started_at ? new Date(kaitenData.started_at).toISOString() : null,
          completed_at: kaitenData.completed_at ? new Date(kaitenData.completed_at).toISOString() : null,
          properties: kaitenData.properties || {},
          tags_cache: kaitenData.tags || [],
          kaiten_created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          kaiten_updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
        };

      case 'time_logs':
        return {
          ...base,
          card_id: kaitenData.card_id,
          user_id: kaitenData.user_id,
          // В JSON поле называется time_spent (в минутах)
          time_spent_minutes: kaitenData.time_spent || 0,
          // В JSON поле называется for_date
          date: kaitenData.for_date, 
          comment: kaitenData.comment || null,
          role_id: kaitenData.role_id || null,
          
          created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
        };

      default:
        return {
          ...base,
          kaiten_created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          kaiten_updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
        };
    }
  }

  /**
   * Разрешение зависимостей (добавляет недостающие сущности)
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
   * Топологическая сортировка (определяет правильный порядок синхронизации)
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

  // === Методы работы с метаданными ===

  private async getSyncMetadata(entityType: EntityType): Promise<{
    entity_type: string;
    last_full_sync_at: string | null;
    last_incremental_sync_at: string | null;
    total_records: number | null; 
    status: string | null;        
    error_message: string | null;
  } | null> {
    if (!this.supabase) return null;

    const { data } = await this.supabase
      .from('sync_metadata')
      .select('*')
      .eq('entity_type', entityType)
      .single();

    return data;
  }

  private async updateSyncMetadata(entityType: EntityType, incremental: boolean, totalRecords: number) {
    if (!this.supabase) return;

    const update: {
      status: string;
      error_message: null;
      total_records: number;
      last_incremental_sync_at?: string;
      last_full_sync_at?: string;
    } = {
      status: 'idle',
      error_message: null,
      total_records: totalRecords,
    };

    if (incremental) {
      update.last_incremental_sync_at = new Date().toISOString();
    } else {
      update.last_full_sync_at = new Date().toISOString();
    }

    await this.supabase
      .from('sync_metadata')
      .update(update)
      .eq('entity_type', entityType);
  }

  private async createSyncLog(entityType: EntityType, syncType: string): Promise<number> {
    if (!this.supabase) return 0;

    const { data } = await this.supabase
      .from('sync_logs')
      .insert({
        entity_type: entityType,
        sync_type: syncType,
        status: 'started',
      })
      .select('id')
      .single();

    return data?.id || 0;
  }

  private async completeSyncLog(logId: number, stats: any, durationMs: number) {
    if (!this.supabase || !logId) return;

    await this.supabase
      .from('sync_logs')
      .update({
        status: 'completed',
        ...stats,
        completed_at: new Date().toISOString(),
        duration_ms: durationMs,
      })
      .eq('id', logId);
  }

  private async failSyncLog(logId: number, errorMessage: string, durationMs: number) {
    if (!this.supabase || !logId) return;

    await this.supabase
      .from('sync_logs')
      .update({
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
        duration_ms: durationMs,
      })
      .eq('id', logId);
  }
}

/**
 * Singleton instance
 */
export const syncOrchestrator = new SyncOrchestrator();
