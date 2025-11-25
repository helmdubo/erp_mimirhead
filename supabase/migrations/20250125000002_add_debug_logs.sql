-- 20250125000002_add_debug_logs.sql
-- Создаём таблицу для отладочных логов синхронизации
-- Позволяет видеть логи даже если функция упала по таймауту

BEGIN;

CREATE TABLE IF NOT EXISTS public.sync_debug_logs (
  id bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  entity_type text NULL,
  log_level text NOT NULL DEFAULT 'info', -- info, warning, error
  message text NOT NULL,
  metadata jsonb NULL DEFAULT '{}'::jsonb
);

-- Индекс для быстрого поиска по времени и типу сущности
CREATE INDEX IF NOT EXISTS idx_sync_debug_logs_created_at
  ON public.sync_debug_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sync_debug_logs_entity_type
  ON public.sync_debug_logs(entity_type);

-- Функция для очистки старых логов (старше 7 дней)
CREATE OR REPLACE FUNCTION public.cleanup_old_debug_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.sync_debug_logs
  WHERE created_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE public.sync_debug_logs IS 'Отладочные логи для диагностики синхронизации';

COMMIT;
