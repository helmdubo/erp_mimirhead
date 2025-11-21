/**
 * Sync Orchestrator
 * Управляет синхронизацией данных с Kaiten, разрешает зависимости
 */

import { getServiceSupabaseClient } from "@/lib/supabase/server";
import { kaitenClient, kaitenUtils } from "./client";

type EntityType = 'spaces' | 'boards' | 'columns' | 'lanes' | 'users' | 'card_types' | 'property_definitions' | 'tags' | 'cards';

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

      // Получаем данные из Kaiten
      const kaitenData = await this.fetchFromKaiten(entityType, { updated_since: updatedSince });

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

    console.log(`💾 Starting upsert for ${entityType}: ${data.length} items`);
    const startTime = Date.now();

    // Преобразуем данные в формат БД
    console.log(`  🔄 Transforming ${data.length} items...`);
    const transformStart = Date.now();
    const dbRows = await Promise.all(
      data.map(async (item) => await this.transformToDbFormat(entityType, item))
    );
    console.log(`  ✅ Transform complete: ${Date.now() - transformStart}ms`);

    // Batch upsert (по 100 записей за раз чтобы не перегрузить БД)
    const batchSize = 100;
    console.log(`  💾 Upserting in batches of ${batchSize}...`);
    for (let i = 0; i < dbRows.length; i += batchSize) {
      const batch = dbRows.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(dbRows.length / batchSize);

      const batchStart = Date.now();
      const { error } = await this.supabase
        .schema('kaiten')
        .from(entityType)
        .upsert(batch as any, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Error upserting ${entityType} batch ${batchNum}:`, error);
        throw error;
      }

      console.log(`  ✅ Batch ${batchNum}/${totalBatches}: ${batch.length} rows in ${Date.now() - batchStart}ms`);

      stats.records_processed += batch.length;
      // TODO: Различать created vs updated (нужен отдельный запрос)
      stats.records_updated += batch.length;
    }

    // Для карточек: синхронизируем M:N связи с тегами
    if (entityType === 'cards') {
      console.log(`  🏷️ Syncing card tags for ${data.length} cards...`);
      const tagsStart = Date.now();
      await this.syncCardTags(data);
      console.log(`  ✅ Tags sync complete: ${Date.now() - tagsStart}ms`);
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ Upsert complete for ${entityType}: ${stats.records_processed} rows in ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);

    return stats;
  }

  /**
   * Синхронизация M:N связей карточек с тегами (ОПТИМИЗИРОВАННАЯ)
   */
  private async syncCardTags(cards: any[]): Promise<void> {
    if (!this.supabase) return;
    if (cards.length === 0) return;

    // Собираем все card_id для массового удаления
    const cardIds = cards.map(c => c.id).filter(Boolean);

    if (cardIds.length === 0) return;

    console.log(`    🗑️ Deleting old card_tags for ${cardIds.length} cards...`);

    // Одно массовое удаление вместо N запросов
    const { error: deleteError } = await this.supabase
      .schema('kaiten')
      .from('card_tags')
      .delete()
      .in('card_id', cardIds);

    if (deleteError) {
      console.error(`❌ Error deleting card_tags:`, deleteError);
      // Продолжаем несмотря на ошибку
    }

    // Собираем все новые связи
    const allTagLinks: Array<{ card_id: number; tag_id: number }> = [];

    for (const card of cards) {
      if (!card.id || !card.tags || !Array.isArray(card.tags)) continue;

      for (const tag of card.tags) {
        if (tag.id) {
          allTagLinks.push({
            card_id: card.id,
            tag_id: tag.id,
          });
        }
      }
    }

    if (allTagLinks.length === 0) {
      console.log(`    ℹ️ No tags to insert`);
      return;
    }

    console.log(`    ➕ Inserting ${allTagLinks.length} card-tag links...`);

    // Батчим INSERT по 1000 записей (Supabase лимит)
    const batchSize = 1000;
    for (let i = 0; i < allTagLinks.length; i += batchSize) {
      const batch = allTagLinks.slice(i, i + batchSize);

      const { error: insertError } = await this.supabase
        .schema('kaiten')
        .from('card_tags')
        .insert(batch);

      if (insertError) {
        console.error(`❌ Error inserting card_tags batch ${Math.floor(i/batchSize) + 1}:`, insertError);
        // Продолжаем с остальными батчами
      }
    }

    console.log(`    ✅ Card tags synced`);
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
          apps_permissions: kaitenData.apps_permissions,
          locked: kaitenData.locked,
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

      case 'tags':
        return {
          ...base,
          name: kaitenData.name,
          color: kaitenData.color,
          group_name: kaitenData.group_name,
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

      case 'cards':
        return {
          ...base,
          title: kaitenData.title,
          description: kaitenData.description || null,
          space_id: kaitenData.space_id || null,
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
          kaiten_created_at: kaitenData.created ? new Date(kaitenData.created).toISOString() : null,
          kaiten_updated_at: kaitenData.updated ? new Date(kaitenData.updated).toISOString() : null,
        };

      default:
        console.warn(`No transformer for entity type ${entityType}, using default base.`);
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
    total_records: number | null; // Разрешаем null как в database.types.ts
    status: string | null;        // Разрешаем null как в database.types.ts
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
