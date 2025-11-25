/**
 * Debug Logger - записывает логи в БД для диагностики
 * Работает даже если функция упала по таймауту
 */

import { getServiceSupabaseClient } from "@/lib/supabase/server";

type LogLevel = 'info' | 'warning' | 'error';

class DebugLogger {
  private supabase = getServiceSupabaseClient();
  private enabled = process.env.ENABLE_DEBUG_LOGS === 'true';

  async log(
    level: LogLevel,
    message: string,
    entityType?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!this.enabled || !this.supabase) return;

    try {
      await this.supabase
        .from('sync_debug_logs')
        .insert({
          log_level: level,
          message,
          entity_type: entityType,
          metadata: metadata || {},
        });
    } catch (error) {
      // Молча игнорируем ошибки логирования
      console.error('[DebugLogger] Failed to write log:', error);
    }
  }

  async info(message: string, entityType?: string, metadata?: Record<string, any>): Promise<void> {
    console.log(message, metadata);
    await this.log('info', message, entityType, metadata);
  }

  async warning(message: string, entityType?: string, metadata?: Record<string, any>): Promise<void> {
    console.warn(message, metadata);
    await this.log('warning', message, entityType, metadata);
  }

  async error(message: string, entityType?: string, metadata?: Record<string, any>): Promise<void> {
    console.error(message, metadata);
    await this.log('error', message, entityType, metadata);
  }

  /**
   * Получить последние логи для просмотра
   */
  async getRecentLogs(limit = 100): Promise<any[]> {
    if (!this.supabase) return [];

    const { data, error } = await this.supabase
      .from('sync_debug_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[DebugLogger] Failed to fetch logs:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Очистить логи
   */
  async clearLogs(): Promise<void> {
    if (!this.supabase) return;
    await this.supabase.rpc('cleanup_old_debug_logs');
  }
}

export const debugLogger = new DebugLogger();
