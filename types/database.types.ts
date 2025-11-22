export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      sync_logs: {
        Row: {
          completed_at: string | null;
          duration_ms: number | null;
          entity_type: string;
          error_message: string | null;
          id: number;
          metadata: Json | null;
          records_created: number | null;
          records_processed: number | null;
          records_skipped: number | null;
          records_updated: number | null;
          started_at: string;
          status: string;
          sync_type: string;
        };
        Insert: {
          completed_at?: string | null;
          duration_ms?: number | null;
          entity_type: string;
          error_message?: string | null;
          id?: number;
          metadata?: Json | null;
          records_created?: number | null;
          records_processed?: number | null;
          records_skipped?: number | null;
          records_updated?: number | null;
          started_at?: string;
          status: string;
          sync_type: string;
        };
        Update: {
          completed_at?: string | null;
          duration_ms?: number | null;
          entity_type?: string;
          error_message?: string | null;
          id?: number;
          metadata?: Json | null;
          records_created?: number | null;
          records_processed?: number | null;
          records_skipped?: number | null;
          records_updated?: number | null;
          started_at?: string;
          status?: string;
          sync_type?: string;
        };
        Relationships: [];
      };
      sync_metadata: {
        Row: {
          created_at: string;
          entity_type: string;
          error_message: string | null;
          last_full_sync_at: string | null;
          last_incremental_sync_at: string | null;
          last_synced_id: number | null;
          metadata: Json | null;
          status: string | null;
          total_records: number | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          entity_type: string;
          error_message?: string | null;
          last_full_sync_at?: string | null;
          last_incremental_sync_at?: string | null;
          last_synced_id?: number | null;
          metadata?: Json | null;
          status?: string | null;
          total_records?: number | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          entity_type?: string;
          error_message?: string | null;
          last_full_sync_at?: string | null;
          last_incremental_sync_at?: string | null;
          last_synced_id?: number | null;
          metadata?: Json | null;
          status?: string | null;
          total_records?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      list_tables: {
        Args: {
          schema_names?: string[];
        };
        Returns: {
          schemaname: string;
          tablename: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  kaiten: {
    Tables: {
      boards: {
        Row: {
          archived: boolean | null;
          board_type: string | null;
          description: string | null;
          id: number;
          kaiten_created_at: string | null;
          kaiten_updated_at: string | null;
          payload_hash: string | null;
          raw_payload: Json;
          sort_order: number | null;
          space_id: number | null;
          synced_at: string;
          title: string;
          uid: string | null;
        };
        Insert: {
          archived?: boolean | null;
          board_type?: string | null;
          description?: string | null;
          id: number;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          payload_hash?: string | null;
          raw_payload?: Json;
          sort_order?: number | null;
          space_id?: number | null;
          synced_at?: string;
          title: string;
          uid?: string | null;
        };
        Update: {
          archived?: boolean | null;
          board_type?: string | null;
          description?: string | null;
          id?: number;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          payload_hash?: string | null;
          raw_payload?: Json;
          sort_order?: number | null;
          space_id?: number | null;
          synced_at?: string;
          title?: string;
          uid?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "boards_space_id_fkey";
            columns: ["space_id"];
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          }
        ];
      };
      card_members: {
        Row: {
          card_id: number;
          user_id: number;
        };
        Insert: {
          card_id: number;
          user_id: number;
        };
        Update: {
          card_id?: number;
          user_id?: number;
        };
        Relationships: [];
      };
      card_tags: {
        Row: {
          card_id: number;
          tag_id: number;
        };
        Insert: {
          card_id: number;
          tag_id: number;
        };
        Update: {
          card_id?: number;
          tag_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "card_tags_card_id_fkey";
            columns: ["card_id"];
            referencedRelation: "cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "card_tags_tag_id_fkey";
            columns: ["tag_id"];
            referencedRelation: "tags";
            referencedColumns: ["id"];
          }
        ];
      };
      card_types: {
        Row: {
          id: number;
          icon_url: string | null;
          kaiten_created_at: string | null;
          kaiten_updated_at: string | null;
          name: string;
          raw_payload: Json;
          synced_at: string;
          uid: string | null;
          payload_hash: string | null;
        };
        Insert: {
          id: number;
          icon_url?: string | null;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          name: string;
          raw_payload?: Json;
          synced_at?: string;
          uid?: string | null;
          payload_hash?: string | null;
        };
        Update: {
          id?: number;
          icon_url?: string | null;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          name?: string;
          raw_payload?: Json;
          synced_at?: string;
          uid?: string | null;
          payload_hash?: string | null;
        };
        Relationships: [];
      };
      cards: {
        Row: {
          archived: boolean | null;
          blocked: boolean | null;
          board_id: number | null;
          column_id: number | null;
          completed_at: string | null;
          creator_id: number | null;
          description: string | null;
          due_date: string | null;
          id: number;
          kaiten_created_at: string | null;
          kaiten_updated_at: string | null;
          lane_id: number | null;
          owner_id: number | null;
          payload_hash: string | null;
          properties: Json;
          raw_payload: Json;
          size_text: string | null;
          space_id: number | null;
          started_at: string | null;
          state: number | null;
          synced_at: string;
          tags_cache: Json;
          time_blocked_sum: number | null;
          time_spent_sum: number | null;
          title: string;
          type_id: number | null;
          uid: string | null;
          estimate_workload: number | null;
          parents_ids: number[] | null;
          children_ids: number[] | null;
          members_ids: number[] | null;
        };
        Insert: {
          archived?: boolean | null;
          blocked?: boolean | null;
          board_id?: number | null;
          column_id?: number | null;
          completed_at?: string | null;
          creator_id?: number | null;
          description?: string | null;
          due_date?: string | null;
          id: number;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          lane_id?: number | null;
          owner_id?: number | null;
          payload_hash?: string | null;
          properties?: Json;
          raw_payload?: Json;
          size_text?: string | null;
          space_id?: number | null;
          started_at?: string | null;
          state?: number | null;
          synced_at?: string;
          tags_cache?: Json;
          time_blocked_sum?: number | null;
          time_spent_sum?: number | null;
          title: string;
          type_id?: number | null;
          uid?: string | null;
          estimate_workload?: number | null;
          parents_ids?: number[] | null;
          children_ids?: number[] | null;
          members_ids?: number[] | null;
        };
        Update: {
          archived?: boolean | null;
          blocked?: boolean | null;
          board_id?: number | null;
          column_id?: number | null;
          completed_at?: string | null;
          creator_id?: number | null;
          description?: string | null;
          due_date?: string | null;
          id?: number;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          lane_id?: number | null;
          owner_id?: number | null;
          payload_hash?: string | null;
          properties?: Json;
          raw_payload?: Json;
          size_text?: string | null;
          space_id?: number | null;
          started_at?: string | null;
          state?: number | null;
          synced_at?: string;
          tags_cache?: Json;
          time_blocked_sum?: number | null;
          time_spent_sum?: number | null;
          title?: string;
          type_id?: number | null;
          uid?: string | null;
          estimate_workload?: number | null;
          parents_ids?: number[] | null;
          children_ids?: number[] | null;
          members_ids?: number[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "cards_board_id_fkey";
            columns: ["board_id"];
            referencedRelation: "boards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cards_column_id_fkey";
            columns: ["column_id"];
            referencedRelation: "columns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cards_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cards_lane_id_fkey";
            columns: ["lane_id"];
            referencedRelation: "lanes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cards_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cards_space_id_fkey";
            columns: ["space_id"];
            referencedRelation: "spaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cards_type_id_fkey";
            columns: ["type_id"];
            referencedRelation: "card_types";
            referencedColumns: ["id"];
          }
        ];
      };
      columns: {
        Row: {
          archived: boolean | null;
          board_id: number | null;
          column_type: number | null;
          id: number;
          kaiten_created_at: string | null;
          kaiten_updated_at: string | null;
          payload_hash: string | null;
          raw_payload: Json;
          sort_order: number | null;
          synced_at: string;
          title: string | null;
          uid: string | null;
          wip_limit: number | null;
        };
        Insert: {
          archived?: boolean | null;
          board_id?: number | null;
          column_type?: number | null;
          id: number;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          payload_hash?: string | null;
          raw_payload?: Json;
          sort_order?: number | null;
          synced_at?: string;
          title?: string | null;
          uid?: string | null;
          wip_limit?: number | null;
        };
        Update: {
          archived?: boolean | null;
          board_id?: number | null;
          column_type?: number | null;
          id?: number;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          payload_hash?: string | null;
          raw_payload?: Json;
          sort_order?: number | null;
          synced_at?: string;
          title?: string | null;
          uid?: string | null;
          wip_limit?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "columns_board_id_fkey";
            columns: ["board_id"];
            referencedRelation: "boards";
            referencedColumns: ["id"];
          }
        ];
      };
      lanes: {
        Row: {
          archived: boolean | null;
          board_id: number | null;
          id: number;
          kaiten_created_at: string | null;
          kaiten_updated_at: string | null;
          payload_hash: string | null;
          raw_payload: Json;
          sort_order: number | null;
          synced_at: string;
          title: string | null;
          uid: string | null;
        };
        Insert: {
          archived?: boolean | null;
          board_id?: number | null;
          id: number;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          payload_hash?: string | null;
          raw_payload?: Json;
          sort_order?: number | null;
          synced_at?: string;
          title?: string | null;
          uid?: string | null;
        };
        Update: {
          archived?: boolean | null;
          board_id?: number | null;
          id?: number;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          payload_hash?: string | null;
          raw_payload?: Json;
          sort_order?: number | null;
          synced_at?: string;
          title?: string | null;
          uid?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lanes_board_id_fkey";
            columns: ["board_id"];
            referencedRelation: "boards";
            referencedColumns: ["id"];
          }
        ];
      };
      property_definitions: {
        Row: {
          field_type: string | null;
          id: number;
          kaiten_created_at: string | null;
          kaiten_updated_at: string | null;
          name: string;
          raw_payload: Json;
          select_options: Json | null;
          synced_at: string;
          uid: string | null;
          payload_hash: string | null;
        };
        Insert: {
          field_type?: string | null;
          id: number;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          name: string;
          raw_payload?: Json;
          select_options?: Json | null;
          synced_at?: string;
          uid?: string | null;
          payload_hash?: string | null;
        };
        Update: {
          field_type?: string | null;
          id?: number;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          name?: string;
          raw_payload?: Json;
          select_options?: Json | null;
          synced_at?: string;
          uid?: string | null;
          payload_hash?: string | null;
        };
        Relationships: [];
      };
      spaces: {
        Row: {
          archived: boolean | null;
          company_id: number | null;
          id: number;
          kaiten_created_at: string | null;
          kaiten_updated_at: string | null;
          owner_user_id: number | null;
          payload_hash: string | null;
          raw_payload: Json;
          sort_order: number | null;
          synced_at: string;
          title: string;
          uid: string | null;
        };
        Insert: {
          archived?: boolean | null;
          company_id?: number | null;
          id: number;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          owner_user_id?: number | null;
          payload_hash?: string | null;
          raw_payload?: Json;
          sort_order?: number | null;
          synced_at?: string;
          title: string;
          uid?: string | null;
        };
        Update: {
          archived?: boolean | null;
          company_id?: number | null;
          id?: number;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          owner_user_id?: number | null;
          payload_hash?: string | null;
          raw_payload?: Json;
          sort_order?: number | null;
          synced_at?: string;
          title?: string;
          uid?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "spaces_owner_user_id_fkey";
            columns: ["owner_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      tags: {
        Row: {
          color: string | null;
          group_name: string | null;
          id: number;
          name: string;
          raw_payload: Json;
          synced_at: string;
          uid: string | null;
          kaiten_created_at: string | null;
          kaiten_updated_at: string | null;
          payload_hash: string | null;
        };
        Insert: {
          color?: string | null;
          group_name?: string | null;
          id: number;
          name: string;
          raw_payload?: Json;
          synced_at?: string;
          uid?: string | null;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          payload_hash?: string | null;
        };
        Update: {
          color?: string | null;
          group_name?: string | null;
          id?: number;
          name?: string;
          raw_payload?: Json;
          synced_at?: string;
          uid?: string | null;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          payload_hash?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          apps_permissions: number | null;
          email: string | null;
          full_name: string | null;
          id: number;
          is_admin: boolean | null;
          kaiten_created_at: string | null;
          kaiten_updated_at: string | null;
          last_request_date: string | null;
          locked: boolean | null;
          payload_hash: string | null;
          raw_payload: Json;
          role: number | null;
          synced_at: string;
          take_licence: boolean | null;
          timezone: string | null;
          uid: string | null;
          username: string | null;
        };
        Insert: {
          apps_permissions?: number | null;
          email?: string | null;
          full_name?: string | null;
          id: number;
          is_admin?: boolean | null;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          last_request_date?: string | null;
          locked?: boolean | null;
          payload_hash?: string | null;
          raw_payload?: Json;
          role?: number | null;
          synced_at?: string;
          take_licence?: boolean | null;
          timezone?: string | null;
          uid?: string | null;
          username?: string | null;
        };
        Update: {
          apps_permissions?: number | null;
          email?: string | null;
          full_name?: string | null;
          id?: number;
          is_admin?: boolean | null;
          kaiten_created_at?: string | null;
          kaiten_updated_at?: string | null;
          last_request_date?: string | null;
          locked?: boolean | null;
          payload_hash?: string | null;
          raw_payload?: Json;
          role?: number | null;
          synced_at?: string;
          take_licence?: boolean | null;
          timezone?: string | null;
          uid?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
