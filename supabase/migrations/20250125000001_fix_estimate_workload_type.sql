-- 20250125000001_fix_estimate_workload_type.sql
-- Исправляем тип estimate_workload с integer на double precision
-- Kaiten API возвращает float значения для estimate_workload

BEGIN;

-- Изменяем тип колонки estimate_workload на double precision
ALTER TABLE kaiten.cards
    ALTER COLUMN estimate_workload TYPE double precision;

-- Обновляем комментарий для ясности
COMMENT ON COLUMN kaiten.cards.estimate_workload IS 'Оценка трудозатрат в часах (может быть дробным числом)';

NOTIFY pgrst, 'reload config';

COMMIT;
