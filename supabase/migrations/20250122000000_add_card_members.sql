-- Создаем таблицу связей Карточка <-> Пользователи (Участники)
CREATE TABLE IF NOT EXISTS kaiten.card_members (
    card_id bigint, -- Ссылки оставим мягкими, как решили ранее для аналитики
    user_id bigint,
    PRIMARY KEY (card_id, user_id)
);

-- Добавляем индексы для быстрого поиска/фильтрации
CREATE INDEX IF NOT EXISTS idx_card_members_card_id ON kaiten.card_members(card_id);
CREATE INDEX IF NOT EXISTS idx_card_members_user_id ON kaiten.card_members(user_id);

-- Обновляем кэш API
NOTIFY pgrst, 'reload config';
