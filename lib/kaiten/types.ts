/**
 * Kaiten API Types
 * Типы данных из Kaiten API
 */

// 1. Тип сущностей (EntityType)
export type EntityType =
  | 'spaces'
  | 'boards'
  | 'columns'
  | 'lanes'
  | 'users'
  | 'card_types'
  | 'property_definitions'
  | 'tags'
  | 'cards'
  | 'time_logs'
  | 'roles'
  | 'tree_entity_roles'   // Каталог ролей доступа (UUID!)
  | 'space_members';      // Участники spaces с ролями

// 2. Параметры пагинации
export interface PaginationParams {
  limit?: number;
  offset?: number;
  updated_since?: string;
  from?: string; 
  to?: string;
}

// 3. Интерфейсы сущностей Kaiten

export interface KaitenRole {
  id: number;
  name: string;
  company_id?: number;
  uid?: string;
  created?: string;
  updated?: string;
  [key: string]: any;
}

// Роли доступа к spaces (tree-entity-roles)
// ВАЖНО: id здесь UUID, не number!
export interface KaitenTreeEntityRole {
  id: string;  // UUID!
  name: string;
  permissions: Record<string, any>;
  sort_order?: number;
  company_uid?: string | null;  // null для стандартных, UUID для кастомных
  new_permissions_default_value?: boolean;
  locked?: boolean | null;
  created?: string;
  updated?: string;
  [key: string]: any;
}

// Участник space (из /spaces/{id}/users)
export interface KaitenSpaceUser {
  id: number;           // user_id
  uid?: string;
  full_name: string;
  email?: string;
  username?: string;
  
  // Роли пользователя в этом space
  role_ids: string[];           // Все роли (UUID[])
  own_role_ids: string[];       // Собственные роли
  groups_role_ids?: string[];   // Роли через группы
  own_groups_role_ids?: string[];
  
  // Группы пользователя
  groups?: Array<{
    id: number;
    name: string;
    company_id: number;
    permissions: number;
    add_to_cards_and_spaces_enabled: boolean;
    user_id: number;
  }>;
  
  // Legacy поля
  role?: number;
  own_role?: number;
  space_role_id?: number;
  access_mod?: string;
  own_access_mod?: string;
  
  role_permissions?: Record<string, any>;
  current?: boolean;
  
  [key: string]: any;
}

export interface KaitenSpace {
  id: number;
  title: string;
  company_id?: number;
  owner_user_id?: number;
  archived?: boolean;
  sort_order?: number;
  created?: string;
  updated?: string;
  [key: string]: any;
}

export interface KaitenBoard {
  id: number;
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

export interface KaitenColumn {
  id: number;
  title: string;
  board_id: number;
  type: number; // Column Type (1=Queue, 2=In Progress, 3=Done)
  sort_order?: number;
  wip_limit?: number;
  archived?: boolean;
  created?: string;
  updated?: string;
  [key: string]: any;
}

export interface KaitenLane {
  id: number;
  title: string;
  board_id: number;
  sort_order?: number;
  archived?: boolean;
  created?: string;
  updated?: string;
  [key: string]: any;
}

export interface KaitenUser {
  id: number;
  full_name: string;
  username?: string;
  email?: string;
  timezone?: string;
  role?: number;
  is_admin?: boolean;
  take_licence?: boolean;
  apps_permissions?: number;
  locked?: boolean;
  last_request_date?: string;
  created?: string;
  updated?: string;
  [key: string]: any;
}

export interface KaitenCardType {
  id: number;
  name: string;
  icon_url?: string;
  created?: string;
  updated?: string;
  [key: string]: any;
}

export interface KaitenPropertyDefinition {
  id: number;
  name: string;
  type?: string;
  select_options?: any;
  created?: string;
  updated?: string;
  [key: string]: any;
}

export interface KaitenTag {
  id: number;
  name: string;
  color?: string;
  group_name?: string;
  created?: string;
  updated?: string;
  [key: string]: any;
}

export interface KaitenCard {
  id: number;
  title: string;
  description?: string;
  
  // IDs
  space_id?: number;
  board_id: number;
  column_id: number;
  lane_id?: number;
  type_id?: number;
  owner_id?: number;
  creator_id?: number;
  
  // Arrays (Raw Data)
  parents?: any[];
  children?: any[];
  members?: any[];
  tags?: any[];
  
  // State
  state?: number;
  archived?: boolean;
  blocked?: boolean;
  
  // Metrics
  size_text?: string;
  estimate_workload?: number;
  time_spent_sum?: number;
  time_blocked_sum?: number;
  
  // Dates
  due_date?: string;
  started_at?: string;
  completed_at?: string;
  created?: string;
  updated?: string;
  
  properties?: any;
  external_id?: string;
  [key: string]: any;
}

export interface KaitenTimeLog {
  id: number;
  time_spent?: number; // minutes
  time_spent_minutes?: number;
  for_date?: string;   // YYYY-MM-DD
  date?: string;
  
  card_id?: number;
  user_id?: number;
  author_id?: number;
  role_id?: number;
  
  comment?: string;
  created?: string;
  updated?: string;
  [key: string]: any;
}