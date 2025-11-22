-- 20250122000001_add_missing_card_fields.sql
-- Добавляем недостающие поля в таблицу cards и чиним space_id

BEGIN;

-- 1. Добавляем новые колонки в таблицу cards
ALTER TABLE kaiten.cards
    ADD COLUMN IF NOT EXISTS estimate_workload integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS parents_ids bigint[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS children_ids bigint[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS members_ids bigint[] DEFAULT '{}'; -- Кешированный массив участников

-- 2. Функция для автоматического заполнения space_id из таблицы boards
-- Если space_id не пришел из API, берем его у родительской доски
CREATE OR REPLACE FUNCTION kaiten.fill_card_space_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.space_id IS NULL AND NEW.board_id IS NOT NULL THEN
        SELECT space_id INTO NEW.space_id
        FROM kaiten.boards
        WHERE id = NEW.board_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Создаем триггер, который срабатывает перед вставкой или обновлением карточки
DROP TRIGGER IF EXISTS trigger_fill_card_space_id ON kaiten.cards;
CREATE TRIGGER trigger_fill_card_space_id
    BEFORE INSERT OR UPDATE ON kaiten.cards
    FOR EACH ROW
    EXECUTE FUNCTION kaiten.fill_card_space_id();

-- 4. Массово обновляем существующие карточки, у которых нет space_id
UPDATE kaiten.cards c
SET space_id = b.space_id
FROM kaiten.boards b
WHERE c.board_id = b.id
  AND c.space_id IS NULL;

NOTIFY pgrst, 'reload config';

COMMIT;
