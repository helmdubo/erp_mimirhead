-- Add sync metadata tracking table

BEGIN;

-- Таблица для отслеживания последней синхронизации каждой entity
CREATE TABLE IF NOT EXISTS public.sync_metadata (
  entity_type text PRIMARY KEY,  -- 'spaces', 'boards', 'cards', etc.
  last_full_sync_at timestamptz,
  last_incremental_sync_at timestamptz,
  last_synced_id bigint,         -- Для пагинации
  total_records integer DEFAULT 0,
  status text DEFAULT 'idle',     -- 'idle', 'running', 'error'
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Таблица для логирования синхронизаций
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id bigserial PRIMARY KEY,
  entity_type text NOT NULL,
  sync_type text NOT NULL,       -- 'full', 'incremental', 'webhook'
  status text NOT NULL,           -- 'started', 'completed', 'failed'
  records_processed integer DEFAULT 0,
  records_created integer DEFAULT 0,
  records_updated integer DEFAULT 0,
  records_skipped integer DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz,
  duration_ms integer,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_sync_logs_entity_type
  ON public.sync_logs(entity_type);

CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at
  ON public.sync_logs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_sync_logs_status
  ON public.sync_logs(status)
  WHERE status != 'completed';

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION public.update_sync_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_metadata_updated_at
  BEFORE UPDATE ON public.sync_metadata
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sync_metadata_updated_at();

-- Начальные записи для всех entity типов
INSERT INTO public.sync_metadata (entity_type) VALUES
  ('spaces'),
  ('boards'),
  ('columns'),
  ('lanes'),
  ('users'),
  ('card_types'),
  ('property_definitions'),
  ('tags'),
  ('cards')
ON CONFLICT (entity_type) DO NOTHING;

COMMIT;
