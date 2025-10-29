export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      friends: {
        Row: {
          id: string
          user_id: string
          line_user_id: string
          display_name: string
          picture_url: string | null
          status_message: string | null
          is_blocked: boolean
          created_at: string
          updated_at: string
          last_interaction_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          line_user_id: string
          display_name: string
          picture_url?: string | null
          status_message?: string | null
          is_blocked?: boolean
          created_at?: string
          updated_at?: string
          last_interaction_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          line_user_id?: string
          display_name?: string
          picture_url?: string | null
          status_message?: string | null
          is_blocked?: boolean
          created_at?: string
          updated_at?: string
          last_interaction_at?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "friends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      friend_tags: {
        Row: {
          id: string
          friend_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          friend_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          friend_id?: string
          tag_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_tags_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      segments: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          conditions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          conditions: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          conditions?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "segments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string | null
          description: string | null
          type: 'text' | 'image' | 'video' | 'flex' | 'carousel'
          content: Json
          variables: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category?: string | null
          description?: string | null
          type: 'text' | 'image' | 'video' | 'flex' | 'carousel'
          content: Json
          variables?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string | null
          description?: string | null
          type?: 'text' | 'image' | 'video' | 'flex' | 'carousel'
          content?: Json
          variables?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          user_id: string
          type: 'text' | 'image' | 'video' | 'audio' | 'flex' | 'template'
          content: Json
          target_type: 'all' | 'segment' | 'tags' | 'manual'
          target_ids: string[] | null
          scheduled_at: string | null
          status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'cancelled'
          total_recipients: number
          sent_count: number
          delivered_count: number
          read_count: number
          click_count: number
          error_count: number
          created_at: string
          updated_at: string
          sent_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'text' | 'image' | 'video' | 'audio' | 'flex' | 'template'
          content: Json
          target_type: 'all' | 'segment' | 'tags' | 'manual'
          target_ids?: string[] | null
          scheduled_at?: string | null
          status?: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'cancelled'
          total_recipients?: number
          sent_count?: number
          delivered_count?: number
          read_count?: number
          click_count?: number
          error_count?: number
          created_at?: string
          updated_at?: string
          sent_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'text' | 'image' | 'video' | 'audio' | 'flex' | 'template'
          content?: Json
          target_type?: 'all' | 'segment' | 'tags' | 'manual'
          target_ids?: string[] | null
          scheduled_at?: string | null
          status?: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'cancelled'
          total_recipients?: number
          sent_count?: number
          delivered_count?: number
          read_count?: number
          click_count?: number
          error_count?: number
          created_at?: string
          updated_at?: string
          sent_at?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      message_recipients: {
        Row: {
          id: string
          message_id: string
          friend_id: string
          status: 'pending' | 'sent' | 'delivered' | 'failed'
          error_message: string | null
          sent_at: string | null
          delivered_at: string | null
          read_at: string | null
          clicked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          message_id: string
          friend_id: string
          status?: 'pending' | 'sent' | 'delivered' | 'failed'
          error_message?: string | null
          sent_at?: string | null
          delivered_at?: string | null
          read_at?: string | null
          clicked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          friend_id?: string
          status?: 'pending' | 'sent' | 'delivered' | 'failed'
          error_message?: string | null
          sent_at?: string | null
          delivered_at?: string | null
          read_at?: string | null
          clicked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_recipients_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_recipients_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "friends"
            referencedColumns: ["id"]
          }
        ]
      }
      forms: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'draft' | 'published' | 'closed'
          questions: Json
          settings: Json
          total_responses: number
          response_rate: number
          created_at: string
          updated_at: string
          published_at: string | null
          closed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: 'draft' | 'published' | 'closed'
          questions?: Json
          settings?: Json
          total_responses?: number
          response_rate?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
          closed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'draft' | 'published' | 'closed'
          questions?: Json
          settings?: Json
          total_responses?: number
          response_rate?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
          closed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      form_responses: {
        Row: {
          id: string
          form_id: string
          friend_id: string
          answers: Json
          submitted_at: string
          created_at: string
        }
        Insert: {
          id?: string
          form_id: string
          friend_id: string
          answers: Json
          submitted_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          friend_id?: string
          answers?: Json
          submitted_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_responses_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "friends"
            referencedColumns: ["id"]
          }
        ]
      }
      reservation_types: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          duration_minutes: number
          buffer_minutes: number
          status: 'active' | 'inactive'
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          duration_minutes?: number
          buffer_minutes?: number
          status?: 'active' | 'inactive'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          duration_minutes?: number
          buffer_minutes?: number
          status?: 'active' | 'inactive'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_types_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      available_slots: {
        Row: {
          id: string
          reservation_type_id: string
          start_time: string
          end_time: string
          capacity: number
          booked_count: number
          status: 'available' | 'unavailable'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reservation_type_id: string
          start_time: string
          end_time: string
          capacity?: number
          booked_count?: number
          status?: 'available' | 'unavailable'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reservation_type_id?: string
          start_time?: string
          end_time?: string
          capacity?: number
          booked_count?: number
          status?: 'available' | 'unavailable'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "available_slots_reservation_type_id_fkey"
            columns: ["reservation_type_id"]
            isOneToOne: false
            referencedRelation: "reservation_types"
            referencedColumns: ["id"]
          }
        ]
      }
      reservations: {
        Row: {
          id: string
          reservation_type_id: string
          slot_id: string
          friend_id: string | null
          customer_name: string
          customer_email: string
          customer_phone: string | null
          customer_memo: string | null
          status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          line_user_id: string | null
          created_at: string
          updated_at: string
          cancelled_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          reservation_type_id: string
          slot_id: string
          friend_id?: string | null
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          customer_memo?: string | null
          status?: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          line_user_id?: string | null
          created_at?: string
          updated_at?: string
          cancelled_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          reservation_type_id?: string
          slot_id?: string
          friend_id?: string | null
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          customer_memo?: string | null
          status?: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          line_user_id?: string | null
          created_at?: string
          updated_at?: string
          cancelled_at?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_reservation_type_id_fkey"
            columns: ["reservation_type_id"]
            isOneToOne: false
            referencedRelation: "reservation_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "available_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "friends"
            referencedColumns: ["id"]
          }
        ]
      }
      reservation_settings: {
        Row: {
          id: string
          user_id: string
          business_hours: Json
          blocked_dates: string[]
          advance_booking_days: number
          cancellation_hours: number
          auto_confirm: boolean
          notification_settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_hours?: Json
          blocked_dates?: string[]
          advance_booking_days?: number
          cancellation_hours?: number
          auto_confirm?: boolean
          notification_settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_hours?: Json
          blocked_dates?: string[]
          advance_booking_days?: number
          cancellation_hours?: number
          auto_confirm?: boolean
          notification_settings?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      url_mappings: {
        Row: {
          id: string
          organization_id: string
          short_code: string
          original_url: string
          message_id: string | null
          click_count: number
          unique_click_count: number
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          short_code: string
          original_url: string
          message_id?: string | null
          click_count?: number
          unique_click_count?: number
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          short_code?: string
          original_url?: string
          message_id?: string | null
          click_count?: number
          unique_click_count?: number
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "url_mappings_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          }
        ]
      }
      url_clicks: {
        Row: {
          id: string
          url_mapping_id: string
          line_friend_id: string | null
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          clicked_at: string
        }
        Insert: {
          id?: string
          url_mapping_id: string
          line_friend_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          clicked_at?: string
        }
        Update: {
          id?: string
          url_mapping_id?: string
          line_friend_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          clicked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "url_clicks_url_mapping_id_fkey"
            columns: ["url_mapping_id"]
            isOneToOne: false
            referencedRelation: "url_mappings"
            referencedColumns: ["id"]
          }
        ]
      }
      custom_reports: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          status: 'active' | 'inactive' | 'draft'
          format: 'pdf' | 'csv' | 'excel'
          date_range: Json
          metrics: Json
          schedule: Json | null
          last_generated: string | null
          next_scheduled: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          status: 'active' | 'inactive' | 'draft'
          format: 'pdf' | 'csv' | 'excel'
          date_range?: Json
          metrics?: Json
          schedule?: Json | null
          last_generated?: string | null
          next_scheduled?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          status?: 'active' | 'inactive' | 'draft'
          format?: 'pdf' | 'csv' | 'excel'
          date_range?: Json
          metrics?: Json
          schedule?: Json | null
          last_generated?: string | null
          next_scheduled?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      report_history: {
        Row: {
          id: string
          report_id: string
          report_name: string
          generated_at: string
          format: 'pdf' | 'csv' | 'excel'
          file_url: string | null
          file_size: number | null
          status: 'generating' | 'completed' | 'failed'
          error: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          report_name: string
          generated_at?: string
          format: 'pdf' | 'csv' | 'excel'
          file_url?: string | null
          file_size?: number | null
          status: 'generating' | 'completed' | 'failed'
          error?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          report_name?: string
          generated_at?: string
          format?: 'pdf' | 'csv' | 'excel'
          file_url?: string | null
          file_size?: number | null
          status?: 'generating' | 'completed' | 'failed'
          error?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_history_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "custom_reports"
            referencedColumns: ["id"]
          }
        ]
      }
      rich_menus: {
        Row: {
          id: string
          user_id: string
          rich_menu_id: string
          line_rich_menu_id: string | null
          name: string
          chat_bar_text: string
          size: Json
          selected: boolean
          areas: Json
          status: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          rich_menu_id: string
          line_rich_menu_id?: string | null
          name: string
          chat_bar_text: string
          size?: Json
          selected?: boolean
          areas?: Json
          status?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          rich_menu_id?: string
          line_rich_menu_id?: string | null
          name?: string
          chat_bar_text?: string
          size?: Json
          selected?: boolean
          areas?: Json
          status?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rich_menus_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      rich_menu_areas: {
        Row: {
          id: string
          rich_menu_id: string
          bounds: Json
          action: Json
          created_at: string
        }
        Insert: {
          id?: string
          rich_menu_id: string
          bounds: Json
          action: Json
          created_at?: string
        }
        Update: {
          id?: string
          rich_menu_id?: string
          bounds?: Json
          action?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rich_menu_areas_rich_menu_id_fkey"
            columns: ["rich_menu_id"]
            isOneToOne: false
            referencedRelation: "rich_menus"
            referencedColumns: ["id"]
          }
        ]
      }
      line_channels: {
        Row: {
          id: string
          user_id: string
          channel_id: string
          channel_secret: string
          access_token: string
          channel_name: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          channel_id: string
          channel_secret: string
          access_token: string
          channel_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          channel_id?: string
          channel_secret?: string
          access_token?: string
          channel_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "line_channels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
