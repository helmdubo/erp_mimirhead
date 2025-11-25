/**
 * Kaiten API Types
 * Типы данных из Kaiten API
 */

// Карточка (Card)
export interface KaitenCard {
  id: number;
  uid?: string;
  title: string;
  description?: string;
  board_id: number;
  space_id: number;
  column_id: number;
  lane_id?: number;
  type_id?: number;
  owner_id?: number;
  creator_id?: number;
  state?: number;
  archived?: boolean;
  blocked?: boolean;
  size_text?: string;
  due_date?: string;
  time_spent_sum?: number;
  time_blocked_sum?: number;
  started_at?: string;
  completed_at?: string;
  properties?: Record<string, any>;
  tags?: Array<{ id: number; name: string; color?: string }>;

  // Новые поля для внутреннего использования
  estimate_workload?: number;
  parents_ids?: number[];
  children_ids?: number[];
  members?: Array<{ id: number; full_name?: string; username?: string }>;

  created?: string;
  updated?: string;
  [key: string]: any;
}

// Доска (Board)
export interface KaitenBoard {
  id: number;
  uid?: string;
  space_id: number;
  title: string;
  description?: string;
  board_type?: string;
  archived?: boolean;
  sort_order?: number;
  created?: string;
  updated?: string;
  [key: string]: any;
}

// Пространство (Space)
export interface KaitenSpace {
  id: number;
  uid?: string;
  title: string;
  company_id?: number;
  owner_user_id?: number;
  archived?: boolean;
  sort_order?: number;
  created?: string;
  updated?: string;
  [key: string]: any;
}

// Пользователь (User)
export interface KaitenUser {
  id: number;
  uid?: string;
  full_name?: string;
  email?: string;
  username?: string;
  timezone?: string;
  role?: number;
  is_admin?: boolean;
  last_request_date?: string;
  created?: string;
  updated?: string;
  [key: string]: any;
}

// Колонка (Column)
export interface KaitenColumn {
  id: number;
  uid?: string;
  board_id: number;
  title?: string;
  column_type?: number;
  sort_order?: number;
  wip_limit?: number;
  archived?: boolean;
  created?: string;
  updated?: string;
  [key: string]: any;
}

// ЛLane (Lane)
export interface KaitenLane {
  id: number;
  uid?: string;
  board_id: number;
  title?: string;
  sort_order?: number;
  archived?: boolean;
  created?: string;
  updated?: string;
  [key: string]: any;
}

// Тип карточки (CardType)
export interface KaitenCardType {
  id: number;
  uid?: string;
  name: string;
  icon_url?: string;
  created?: string;
  updated?: string;
  [key: string]: any;
}

// Тег (Tag)
export interface KaitenTag {
  id: number;
  uid?: string;
  name: string;
  color?: string;
  group_name?: string;
  [key: string]: any;
}

// Определение свойства (PropertyDefinition)
export interface KaitenPropertyDefinition {
  id: number;
  uid?: string;
  name: string;
  field_type?: string;
  select_options?: any[];
  created?: string;
  [key: string]: any;
}

/**
 * Тайм-лог (TimeLog) из Kaiten
 * Описывает одну запись о списании времени пользователем на карточке
 */
export interface KaitenTimeLog {
  id: number;
  uid?: string;
  card_id?: number;
  user_id?: number;
  author_id?: number;
  role_id?: number;
  time_spent?: number;
  time_spent_minutes?: number;
  date?: string;
  for_date?: string;
  comment?: string;
  created?: string;
  updated?: string;
  [key: string]: any;
}

// Параметры пагинации и фильтрации
export interface PaginationParams {
  limit?: number;
  offset?: number;
  updated_since?: string; // ISO timestamp для incremental sync
  from?: string; // Начало интервала (YYYY-MM-DD)
  to?: string;   // Конец интервала (YYYY-MM-DD)
}

// Результат с пагинацией
export interface PaginatedResponse<T> {
  items: T[];
  total?: number;
  hasMore: boolean;
  nextOffset?: number;
}