/**
 * Kaiten API Types
 * Типы данных из Kaiten API
 */

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
  members?: Array<{ id: number }>;
  created?: string;
  updated?: string;
  [key: string]: any;
}

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

export interface KaitenCardType {
  id: number;
  uid?: string;
  name: string;
  icon_url?: string;
  created?: string;
  updated?: string;
  [key: string]: any;
}

export interface KaitenTag {
  id: number;
  uid?: string;
  name: string;
  color?: string;
  group_name?: string;
  [key: string]: any;
}

export interface KaitenPropertyDefinition {
  id: number;
  uid?: string;
  name: string;
  field_type?: string;
  select_options?: any[];
  created?: string;
  [key: string]: any;
}

// Параметры пагинации
export interface PaginationParams {
  limit?: number;
  offset?: number;
  updated_since?: string; // ISO timestamp для incremental sync
}

// Результат с пагинацией
export interface PaginatedResponse<T> {
  items: T[];
  total?: number;
  hasMore: boolean;
  nextOffset?: number;
}
