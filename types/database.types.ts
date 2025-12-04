export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  hr: {
    Tables: {
      employee_history: {
        Row: {
          comment: string | null
          created_at: string | null
          employee_id: number
          grade_id: number | null
          hourly_cost: number | null
          id: number
          job_role_id: number | null
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          employee_id: number
          grade_id?: number | null
          hourly_cost?: number | null
          id?: number
          job_role_id?: number | null
          valid_from: string
          valid_to?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          employee_id?: number
          grade_id?: number | null
          hourly_cost?: number | null
          id?: number
          job_role_id?: number | null
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  kaiten: {
    Tables: {
      boards: {
        Row: {
          archived: boolean | null
          board_type: string | null
          description: string | null
          id: number
          kaiten_created_at: string | null
          kaiten_updated_at: string | null
          payload_hash: string | null
          raw_payload: Json | null
          sort_order: number | null
          space_id: number | null
          synced_at: string
          title: string
          uid: string | null
        }
        Insert: {
          archived?: boolean | null
          board_type?: string | null
          description?: string | null
          id: number
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          payload_hash?: string | null
          raw_payload?: Json | null
          sort_order?: number | null
          space_id?: number | null
          synced_at?: string
          title: string
          uid?: string | null
        }
        Update: {
          archived?: boolean | null
          board_type?: string | null
          description?: string | null
          id?: number
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          payload_hash?: string | null
          raw_payload?: Json | null
          sort_order?: number | null
          space_id?: number | null
          synced_at?: string
          title?: string
          uid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boards_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      card_members: {
        Row: {
          card_id: number
          user_id: number
        }
        Insert: {
          card_id: number
          user_id: number
        }
        Update: {
          card_id?: number
          user_id?: number
        }
        Relationships: []
      }
      card_tags: {
        Row: {
          card_id: number
          tag_id: number
        }
        Insert: {
          card_id: number
          tag_id: number
        }
        Update: {
          card_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "card_tags_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_types: {
        Row: {
          icon_url: string | null
          id: number
          kaiten_created_at: string | null
          kaiten_updated_at: string | null
          name: string
          payload_hash: string | null
          raw_payload: Json | null
          synced_at: string
          uid: string | null
        }
        Insert: {
          icon_url?: string | null
          id: number
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          name: string
          payload_hash?: string | null
          raw_payload?: Json | null
          synced_at?: string
          uid?: string | null
        }
        Update: {
          icon_url?: string | null
          id?: number
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          name?: string
          payload_hash?: string | null
          raw_payload?: Json | null
          synced_at?: string
          uid?: string | null
        }
        Relationships: []
      }
      cards: {
        Row: {
          archived: boolean | null
          blocked: boolean | null
          board_id: number | null
          children_ids: number[] | null
          column_id: number | null
          completed_at: string | null
          creator_id: number | null
          description: string | null
          due_date: string | null
          estimate_workload: number | null
          external_id: string | null
          id: number
          kaiten_created_at: string | null
          kaiten_updated_at: string | null
          lane_id: number | null
          members_data: Json | null
          members_ids: number[] | null
          owner_id: number | null
          parents_ids: number[] | null
          payload_hash: string | null
          properties: Json | null
          raw_payload: Json | null
          size_text: string | null
          space_id: number | null
          started_at: string | null
          state: number | null
          synced_at: string
          tags_cache: Json | null
          time_blocked_sum: number | null
          time_spent_sum: number | null
          title: string
          type_id: number | null
          uid: string | null
        }
        Insert: {
          archived?: boolean | null
          blocked?: boolean | null
          board_id?: number | null
          children_ids?: number[] | null
          column_id?: number | null
          completed_at?: string | null
          creator_id?: number | null
          description?: string | null
          due_date?: string | null
          estimate_workload?: number | null
          external_id?: string | null
          id: number
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          lane_id?: number | null
          members_data?: Json | null
          members_ids?: number[] | null
          owner_id?: number | null
          parents_ids?: number[] | null
          payload_hash?: string | null
          properties?: Json | null
          raw_payload?: Json | null
          size_text?: string | null
          space_id?: number | null
          started_at?: string | null
          state?: number | null
          synced_at?: string
          tags_cache?: Json | null
          time_blocked_sum?: number | null
          time_spent_sum?: number | null
          title: string
          type_id?: number | null
          uid?: string | null
        }
        Update: {
          archived?: boolean | null
          blocked?: boolean | null
          board_id?: number | null
          children_ids?: number[] | null
          column_id?: number | null
          completed_at?: string | null
          creator_id?: number | null
          description?: string | null
          due_date?: string | null
          estimate_workload?: number | null
          external_id?: string | null
          id?: number
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          lane_id?: number | null
          members_data?: Json | null
          members_ids?: number[] | null
          owner_id?: number | null
          parents_ids?: number[] | null
          payload_hash?: string | null
          properties?: Json | null
          raw_payload?: Json | null
          size_text?: string | null
          space_id?: number | null
          started_at?: string | null
          state?: number | null
          synced_at?: string
          tags_cache?: Json | null
          time_blocked_sum?: number | null
          time_spent_sum?: number | null
          title?: string
          type_id?: number | null
          uid?: string | null
        }
        Relationships: []
      }
      columns: {
        Row: {
          archived: boolean | null
          board_id: number | null
          column_type: number | null
          id: number
          kaiten_created_at: string | null
          kaiten_updated_at: string | null
          payload_hash: string | null
          raw_payload: Json | null
          sort_order: number | null
          synced_at: string
          title: string | null
          uid: string | null
          wip_limit: number | null
        }
        Insert: {
          archived?: boolean | null
          board_id?: number | null
          column_type?: number | null
          id: number
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          payload_hash?: string | null
          raw_payload?: Json | null
          sort_order?: number | null
          synced_at?: string
          title?: string | null
          uid?: string | null
          wip_limit?: number | null
        }
        Update: {
          archived?: boolean | null
          board_id?: number | null
          column_type?: number | null
          id?: number
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          payload_hash?: string | null
          raw_payload?: Json | null
          sort_order?: number | null
          synced_at?: string
          title?: string | null
          uid?: string | null
          wip_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "columns_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      lanes: {
        Row: {
          archived: boolean | null
          board_id: number | null
          id: number
          kaiten_created_at: string | null
          kaiten_updated_at: string | null
          payload_hash: string | null
          raw_payload: Json | null
          sort_order: number | null
          synced_at: string
          title: string | null
          uid: string | null
        }
        Insert: {
          archived?: boolean | null
          board_id?: number | null
          id: number
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          payload_hash?: string | null
          raw_payload?: Json | null
          sort_order?: number | null
          synced_at?: string
          title?: string | null
          uid?: string | null
        }
        Update: {
          archived?: boolean | null
          board_id?: number | null
          id?: number
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          payload_hash?: string | null
          raw_payload?: Json | null
          sort_order?: number | null
          synced_at?: string
          title?: string | null
          uid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lanes_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      property_definitions: {
        Row: {
          field_type: string | null
          id: number
          kaiten_created_at: string | null
          kaiten_updated_at: string | null
          name: string
          payload_hash: string | null
          raw_payload: Json | null
          select_options: Json | null
          synced_at: string
          uid: string | null
        }
        Insert: {
          field_type?: string | null
          id: number
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          name: string
          payload_hash?: string | null
          raw_payload?: Json | null
          select_options?: Json | null
          synced_at?: string
          uid?: string | null
        }
        Update: {
          field_type?: string | null
          id?: number
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          name?: string
          payload_hash?: string | null
          raw_payload?: Json | null
          select_options?: Json | null
          synced_at?: string
          uid?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          company_id: number | null
          created_at: string | null
          id: number
          name: string
          payload_hash: string | null
          raw_payload: Json | null
          synced_at: string
          uid: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: number | null
          created_at?: string | null
          id: number
          name: string
          payload_hash?: string | null
          raw_payload?: Json | null
          synced_at?: string
          uid?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: number | null
          created_at?: string | null
          id?: number
          name?: string
          payload_hash?: string | null
          raw_payload?: Json | null
          synced_at?: string
          uid?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      space_members: {
        Row: {
          group_id: number | null
          id: number
          is_from_group: boolean | null
          is_inactive: boolean | null
          role_id: string | null
          space_id: number
          synced_at: string
          user_id: number
        }
        Insert: {
          group_id?: number | null
          id?: never
          is_from_group?: boolean | null
          is_inactive?: boolean | null
          role_id?: string | null
          space_id: number
          synced_at?: string
          user_id: number
        }
        Update: {
          group_id?: number | null
          id?: never
          is_from_group?: boolean | null
          is_inactive?: boolean | null
          role_id?: string | null
          space_id?: number
          synced_at?: string
          user_id?: number
        }
        Relationships: []
      }
      spaces: {
        Row: {
          archived: boolean | null
          company_id: number | null
          id: number
          kaiten_created_at: string | null
          kaiten_updated_at: string | null
          owner_user_id: number | null
          payload_hash: string | null
          raw_payload: Json | null
          sort_order: number | null
          synced_at: string
          title: string
          uid: string | null
        }
        Insert: {
          archived?: boolean | null
          company_id?: number | null
          id: number
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          owner_user_id?: number | null
          payload_hash?: string | null
          raw_payload?: Json | null
          sort_order?: number | null
          synced_at?: string
          title: string
          uid?: string | null
        }
        Update: {
          archived?: boolean | null
          company_id?: number | null
          id?: number
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          owner_user_id?: number | null
          payload_hash?: string | null
          raw_payload?: Json | null
          sort_order?: number | null
          synced_at?: string
          title?: string
          uid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spaces_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spaces_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          group_name: string | null
          id: number
          kaiten_created_at: string | null
          kaiten_updated_at: string | null
          name: string
          payload_hash: string | null
          raw_payload: Json | null
          synced_at: string
          uid: string | null
        }
        Insert: {
          color?: string | null
          group_name?: string | null
          id: number
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          name: string
          payload_hash?: string | null
          raw_payload?: Json | null
          synced_at?: string
          uid?: string | null
        }
        Update: {
          color?: string | null
          group_name?: string | null
          id?: number
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          name?: string
          payload_hash?: string | null
          raw_payload?: Json | null
          synced_at?: string
          uid?: string | null
        }
        Relationships: []
      }
      time_logs: {
        Row: {
          card_id: number | null
          comment: string | null
          created_at: string | null
          date: string | null
          id: number
          payload_hash: string | null
          raw_payload: Json | null
          role_id: number | null
          synced_at: string
          time_spent_minutes: number
          uid: string | null
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          card_id?: number | null
          comment?: string | null
          created_at?: string | null
          date?: string | null
          id: number
          payload_hash?: string | null
          raw_payload?: Json | null
          role_id?: number | null
          synced_at?: string
          time_spent_minutes?: number
          uid?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          card_id?: number | null
          comment?: string | null
          created_at?: string | null
          date?: string | null
          id?: number
          payload_hash?: string | null
          raw_payload?: Json | null
          role_id?: number | null
          synced_at?: string
          time_spent_minutes?: number
          uid?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Relationships: []
      }
      tree_entity_roles: {
        Row: {
          company_uid: string | null
          id: string
          is_locked: boolean | null
          kaiten_created_at: string | null
          kaiten_updated_at: string | null
          name: string
          new_permissions_default_value: boolean | null
          payload_hash: string | null
          permissions: Json | null
          raw_payload: Json | null
          sort_order: number | null
          synced_at: string
        }
        Insert: {
          company_uid?: string | null
          id: string
          is_locked?: boolean | null
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          name: string
          new_permissions_default_value?: boolean | null
          payload_hash?: string | null
          permissions?: Json | null
          raw_payload?: Json | null
          sort_order?: number | null
          synced_at?: string
        }
        Update: {
          company_uid?: string | null
          id?: string
          is_locked?: boolean | null
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          name?: string
          new_permissions_default_value?: boolean | null
          payload_hash?: string | null
          permissions?: Json | null
          raw_payload?: Json | null
          sort_order?: number | null
          synced_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          apps_permissions: number | null
          email: string | null
          full_name: string | null
          id: number
          is_admin: boolean | null
          kaiten_created_at: string | null
          kaiten_updated_at: string | null
          last_request_date: string | null
          locked: boolean | null
          payload_hash: string | null
          raw_payload: Json | null
          role: number | null
          synced_at: string
          take_licence: boolean | null
          timezone: string | null
          uid: string | null
          username: string | null
        }
        Insert: {
          apps_permissions?: number | null
          email?: string | null
          full_name?: string | null
          id: number
          is_admin?: boolean | null
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          last_request_date?: string | null
          locked?: boolean | null
          payload_hash?: string | null
          raw_payload?: Json | null
          role?: number | null
          synced_at?: string
          take_licence?: boolean | null
          timezone?: string | null
          uid?: string | null
          username?: string | null
        }
        Update: {
          apps_permissions?: number | null
          email?: string | null
          full_name?: string | null
          id?: number
          is_admin?: boolean | null
          kaiten_created_at?: string | null
          kaiten_updated_at?: string | null
          last_request_date?: string | null
          locked?: boolean | null
          payload_hash?: string | null
          raw_payload?: Json | null
          role?: number | null
          synced_at?: string
          take_licence?: boolean | null
          timezone?: string | null
          uid?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_space_members_detailed: {
        Row: {
          group_id: number | null
          id: number | null
          is_custom_role: boolean | null
          is_from_group: boolean | null
          is_inactive: boolean | null
          role_id: string | null
          role_name: string | null
          space_id: number | null
          space_title: string | null
          synced_at: string | null
          user_email: string | null
          user_id: number | null
          user_name: string | null
        }
        Relationships: []
      }
      v_user_roles_summary: {
        Row: {
          email: string | null
          full_name: string | null
          has_inactive_membership: boolean | null
          role_names: string[] | null
          space_titles: string[] | null
          spaces_count: number | null
          unique_roles_count: number | null
          user_id: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  ops: {
    Tables: {
      clients: {
        Row: {
          contact_info: string | null
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          contact_info?: string | null
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          contact_info?: string | null
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          active: boolean
          created_at: string | null
          full_name: string
          grade_id: number | null
          hourly_cost: number | null
          id: number
          job_role_id: number | null
          kaiten_role_id: number | null
          kaiten_user_id: number | null
          role: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          full_name: string
          grade_id?: number | null
          hourly_cost?: number | null
          id?: number
          job_role_id?: number | null
          kaiten_role_id?: number | null
          kaiten_user_id?: number | null
          role?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string | null
          full_name?: string
          grade_id?: number | null
          hourly_cost?: number | null
          id?: number
          job_role_id?: number | null
          kaiten_role_id?: number | null
          kaiten_user_id?: number | null
          role?: string | null
        }
        Relationships: []
      }
      project_tag_mapping: {
        Row: {
          id: number
          kaiten_tag_id: number
          kaiten_tag_name: string | null
          project_id: number
        }
        Insert: {
          id?: number
          kaiten_tag_id: number
          kaiten_tag_name?: string | null
          project_id: number
        }
        Update: {
          id?: number
          kaiten_tag_id?: number
          kaiten_tag_name?: string | null
          project_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_tag_mapping_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_id: number
          created_at: string | null
          default_rate: number
          id: number
          kaiten_space_id: number | null
          name: string
        }
        Insert: {
          client_id: number
          created_at?: string | null
          default_rate?: number
          id?: number
          kaiten_space_id?: number | null
          name: string
        }
        Update: {
          client_id?: number
          created_at?: string | null
          default_rate?: number
          id?: number
          kaiten_space_id?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignments: {
        Row: {
          created_at: string | null
          employee_id: number
          id: number
          is_responsible: boolean | null
          role_type: number | null
          task_id: number
        }
        Insert: {
          created_at?: string | null
          employee_id: number
          id?: number
          is_responsible?: boolean | null
          role_type?: number | null
          task_id: number
        }
        Update: {
          created_at?: string | null
          employee_id?: number
          id?: number
          is_responsible?: boolean | null
          role_type?: number | null
          task_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          all_members_ids: number[] | null
          assignee_id: number | null
          children_task_ids: number[] | null
          completed_at: string | null
          estimate_hours: number | null
          external_id: string | null
          id: number
          kaiten_card_id: number
          owner_id: number | null
          parent_task_id: number | null
          project_id: number | null
          raw_synced_at: string
          status: string
          tags: Json | null
          time_spent_sum: number
          title: string
        }
        Insert: {
          all_members_ids?: number[] | null
          assignee_id?: number | null
          children_task_ids?: number[] | null
          completed_at?: string | null
          estimate_hours?: number | null
          external_id?: string | null
          id: number
          kaiten_card_id: number
          owner_id?: number | null
          parent_task_id?: number | null
          project_id?: number | null
          raw_synced_at?: string
          status: string
          tags?: Json | null
          time_spent_sum?: number
          title: string
        }
        Update: {
          all_members_ids?: number[] | null
          assignee_id?: number | null
          children_task_ids?: number[] | null
          completed_at?: string | null
          estimate_hours?: number | null
          external_id?: string | null
          id?: number
          kaiten_card_id?: number
          owner_id?: number | null
          parent_task_id?: number | null
          project_id?: number | null
          raw_synced_at?: string
          status?: string
          tags?: Json | null
          time_spent_sum?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      test_ai_table: {
        Row: {
          created_at: string
          id: number
          note: string | null
          test: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          note?: string | null
          test?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          note?: string | null
          test?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      sync_logs: {
        Row: {
          completed_at: string | null
          duration_ms: number | null
          entity_type: string
          error_message: string | null
          id: number
          metadata: Json | null
          records_created: number | null
          records_processed: number | null
          records_skipped: number | null
          records_updated: number | null
          started_at: string | null
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          duration_ms?: number | null
          entity_type: string
          error_message?: string | null
          id?: number
          metadata?: Json | null
          records_created?: number | null
          records_processed?: number | null
          records_skipped?: number | null
          records_updated?: number | null
          started_at?: string | null
          status: string
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          duration_ms?: number | null
          entity_type?: string
          error_message?: string | null
          id?: number
          metadata?: Json | null
          records_created?: number | null
          records_processed?: number | null
          records_skipped?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: []
      }
      sync_metadata: {
        Row: {
          created_at: string | null
          entity_type: string
          error_message: string | null
          last_full_sync_at: string | null
          last_incremental_sync_at: string | null
          last_synced_id: number | null
          metadata: Json | null
          status: string | null
          total_records: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          entity_type: string
          error_message?: string | null
          last_full_sync_at?: string | null
          last_incremental_sync_at?: string | null
          last_synced_id?: number | null
          metadata?: Json | null
          status?: string | null
          total_records?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          entity_type?: string
          error_message?: string | null
          last_full_sync_at?: string | null
          last_incremental_sync_at?: string | null
          last_synced_id?: number | null
          metadata?: Json | null
          status?: string | null
          total_records?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      list_tables: {
        Args: never
        Returns: {
          schemaname: string
          tablename: string
        }[]
      }
      sync_employee_kaiten_roles: {
        Args: never
        Returns: {
          updated_count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  ref: {
    Tables: {
      grades: {
        Row: {
          created_at: string | null
          id: number
          level: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          level: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          level?: number
          name?: string
        }
        Relationships: []
      }
      job_roles: {
        Row: {
          code: string | null
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  hr: {
    Enums: {},
  },
  kaiten: {
    Enums: {},
  },
  ops: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  ref: {
    Enums: {},
  },
} as const
