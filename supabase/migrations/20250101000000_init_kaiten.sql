-- 20250101000000_init_kaiten.sql
-- Initial schema for Kaiten data mirror

BEGIN;

-- Создаём отдельную схему для зеркала Kaiten
CREATE SCHEMA IF NOT EXISTS kaiten;

-- A. Пользователи Kaiten
CREATE TABLE IF NOT EXISTS kaiten.users (
    id                  bigint PRIMARY KEY,         -- Kaiten numeric ID
    uid                 uuid,                       -- Kaiten UUID
    full_name           text,
    email               text,
    username            text,
    timezone            text,
    role                integer,
    is_admin            boolean DEFAULT false,
    take_licence        boolean,
    apps_permissions    integer,
    locked              boolean,
    last_request_date   timestamptz,                -- last_request_date из Kaiten
    kaiten_created_at   timestamptz,                -- created в Kaiten
    kaiten_updated_at   timestamptz,                -- updated в Kaiten
    synced_at           timestamptz DEFAULT now() NOT NULL, -- момент синка
    payload_hash        text,                       -- хэш полезной части payload
    raw_payload         jsonb DEFAULT '{}'::jsonb   -- урезанный JSON из API
);

CREATE INDEX IF NOT EXISTS idx_kaiten_users_email
    ON kaiten.users (email);


-- B. Пространства (Spaces)
CREATE TABLE IF NOT EXISTS kaiten.spaces (
    id                  bigint PRIMARY KEY,
    uid                 uuid,
    title               text NOT NULL,
    company_id          bigint,
    owner_user_id       bigint REFERENCES kaiten.users(id),
    archived            boolean DEFAULT false,
    sort_order          double precision,
    kaiten_created_at   timestamptz,
    kaiten_updated_at   timestamptz,
    synced_at           timestamptz DEFAULT now() NOT NULL,
    payload_hash        text,
    raw_payload         jsonb DEFAULT '{}'::jsonb
);


-- C. Доски (Boards)
CREATE TABLE IF NOT EXISTS kaiten.boards (
    id                  bigint PRIMARY KEY,
    uid                 uuid,
    space_id            bigint REFERENCES kaiten.spaces(id) ON DELETE CASCADE,
    title               text NOT NULL,
    description         text,
    board_type          text,
    archived            boolean DEFAULT false,
    sort_order          double precision,
    kaiten_created_at   timestamptz,
    kaiten_updated_at   timestamptz,
    synced_at           timestamptz DEFAULT now() NOT NULL,
    payload_hash        text,
    raw_payload         jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_kaiten_boards_space
    ON kaiten.boards (space_id);


-- D. Колонки (Columns)
CREATE TABLE IF NOT EXISTS kaiten.columns (
    id                  bigint PRIMARY KEY,
    uid                 uuid,
    board_id            bigint REFERENCES kaiten.boards(id) ON DELETE CASCADE,
    title               text,
    column_type         integer,
    sort_order          integer,
    wip_limit           integer,
    archived            boolean DEFAULT false,
    kaiten_created_at   timestamptz,
    kaiten_updated_at   timestamptz,
    synced_at           timestamptz DEFAULT now() NOT NULL,
    payload_hash        text,
    raw_payload         jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_kaiten_columns_board
    ON kaiten.columns (board_id);


-- E. Дорожки (Lanes)
CREATE TABLE IF NOT EXISTS kaiten.lanes (
    id                  bigint PRIMARY KEY,
    uid                 uuid,
    board_id            bigint REFERENCES kaiten.boards(id) ON DELETE CASCADE,
    title               text,
    sort_order          integer,
    archived            boolean DEFAULT false,
    kaiten_created_at   timestamptz,
    kaiten_updated_at   timestamptz,
    synced_at           timestamptz DEFAULT now() NOT NULL,
    payload_hash        text,
    raw_payload         jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_kaiten_lanes_board
    ON kaiten.lanes (board_id);


-- F. Типы карточек (Card Types)
CREATE TABLE IF NOT EXISTS kaiten.card_types (
    id                  bigint PRIMARY KEY,
    uid                 uuid,
    name                text NOT NULL,
    icon_url            text,
    kaiten_created_at   timestamptz,
    kaiten_updated_at   timestamptz,
    synced_at           timestamptz DEFAULT now() NOT NULL,
    raw_payload         jsonb DEFAULT '{}'::jsonb
);


-- G. Определения кастомных свойств
CREATE TABLE IF NOT EXISTS kaiten.property_definitions (
    id                  bigint PRIMARY KEY,
    uid                 uuid,
    name                text NOT NULL,
    field_type          text,
    select_options      jsonb,
    kaiten_created_at   timestamptz,
    synced_at           timestamptz DEFAULT now() NOT NULL,
    raw_payload         jsonb DEFAULT '{}'::jsonb
);


-- H. Теги
CREATE TABLE IF NOT EXISTS kaiten.tags (
    id                  bigint PRIMARY KEY,
    uid                 uuid,
    name                text NOT NULL,
    color               text,
    group_name          text,
    synced_at           timestamptz DEFAULT now() NOT NULL,
    raw_payload         jsonb DEFAULT '{}'::jsonb
);


-- I. Карточки (Cards)
CREATE TABLE IF NOT EXISTS kaiten.cards (
    id                  bigint PRIMARY KEY,
    uid                 uuid,
    title               text NOT NULL,
    description         text,

    -- Ссылки
    space_id            bigint REFERENCES kaiten.spaces(id),
    board_id            bigint REFERENCES kaiten.boards(id),
    column_id           bigint REFERENCES kaiten.columns(id),
    lane_id             bigint REFERENCES kaiten.lanes(id),
    type_id             bigint REFERENCES kaiten.card_types(id),
    owner_id            bigint REFERENCES kaiten.users(id),
    creator_id          bigint REFERENCES kaiten.users(id),

    -- Состояние
    state               integer,
    archived            boolean DEFAULT false,
    blocked             boolean DEFAULT false,
    size_text           text,
    due_date            timestamptz,

    -- Временные метрики
    time_spent_sum      integer DEFAULT 0,
    time_blocked_sum    integer DEFAULT 0,
    started_at          timestamptz,
    completed_at        timestamptz,

    -- Кастомные свойства и теги
    properties          jsonb DEFAULT '{}'::jsonb,
    tags_cache          jsonb DEFAULT '[]'::jsonb,

    -- Таймстемпы синка
    kaiten_created_at   timestamptz,
    kaiten_updated_at   timestamptz,
    synced_at           timestamptz DEFAULT now() NOT NULL,
    payload_hash        text,
    raw_payload         jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_kaiten_cards_board
    ON kaiten.cards (board_id);

CREATE INDEX IF NOT EXISTS idx_kaiten_cards_owner
    ON kaiten.cards (owner_id);

CREATE INDEX IF NOT EXISTS idx_kaiten_cards_completed_at
    ON kaiten.cards (completed_at);

CREATE INDEX IF NOT EXISTS idx_kaiten_cards_properties
    ON kaiten.cards USING gin (properties);


-- J. Связка "карточка — тег"
CREATE TABLE IF NOT EXISTS kaiten.card_tags (
    card_id             bigint REFERENCES kaiten.cards(id) ON DELETE CASCADE,
    tag_id              bigint REFERENCES kaiten.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (card_id, tag_id)
);

COMMIT;
