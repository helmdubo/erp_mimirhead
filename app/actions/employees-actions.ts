"use server";

import { getServiceSupabaseClient } from "@/lib/supabase/server";

export interface SpaceMemberDetail {
  space_id: number;
  space_title: string;
  user_id: number;
  user_name: string;
  user_email: string;
  role_id: string;
  role_name: string;
  is_from_group: boolean;
  group_id: number | null;
  is_custom_role: boolean;
}

export interface UserRoleSummary {
  user_id: number;
  full_name: string;
  email: string;
  spaces_count: number;
  unique_roles_count: number;
  role_names: string[];
  space_titles: string[];
}

export interface TreeEntityRole {
  id: string;
  name: string;
  company_uid: string | null;
  sort_order: number;
  is_locked: boolean;
}

/**
 * Получить детальный список участников spaces
 */
export async function getSpaceMembersDetailed(): Promise<{
  data: SpaceMemberDetail[];
  error?: string;
}> {
  const supabase = getServiceSupabaseClient();
  if (!supabase) return { data: [], error: "Supabase not available" };

  try {
    const { data, error } = await supabase
      .schema("kaiten")
      .from("v_space_members_detailed")
      .select("*")
      .order("space_title")
      .order("user_name");

    if (error) return { data: [], error: error.message };
    return { data: data || [] };
  } catch (e: any) {
    return { data: [], error: e.message };
  }
}

/**
 * Получить сводку по пользователям
 */
export async function getUserRolesSummary(): Promise<{
  data: UserRoleSummary[];
  error?: string;
}> {
  const supabase = getServiceSupabaseClient();
  if (!supabase) return { data: [], error: "Supabase not available" };

  try {
    const { data, error } = await supabase
      .schema("kaiten")
      .from("v_user_roles_summary")
      .select("*")
      .order("full_name");

    if (error) return { data: [], error: error.message };
    return { data: data || [] };
  } catch (e: any) {
    return { data: [], error: e.message };
  }
}

/**
 * Получить каталог ролей
 */
export async function getTreeEntityRoles(): Promise<{
  data: TreeEntityRole[];
  error?: string;
}> {
  const supabase = getServiceSupabaseClient();
  if (!supabase) return { data: [], error: "Supabase not available" };

  try {
    const { data, error } = await supabase
      .schema("kaiten")
      .from("tree_entity_roles")
      .select("id, name, company_uid, sort_order, is_locked")
      .order("sort_order");

    if (error) return { data: [], error: error.message };
    return { data: data || [] };
  } catch (e: any) {
    return { data: [], error: e.message };
  }
}

/**
 * Получить список spaces для фильтра
 */
export async function getSpacesForFilter(): Promise<{
  data: { id: number; title: string }[];
  error?: string;
}> {
  const supabase = getServiceSupabaseClient();
  if (!supabase) return { data: [], error: "Supabase not available" };

  try {
    const { data, error } = await supabase
      .schema("kaiten")
      .from("spaces")
      .select("id, title")
      .order("title");

    if (error) return { data: [], error: error.message };
    return { data: data || [] };
  } catch (e: any) {
    return { data: [], error: e.message };
  }
}
