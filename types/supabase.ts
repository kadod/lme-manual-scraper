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
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          line_friend_id: string | null
          organization_id: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          line_friend_id?: string | null
          organization_id: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          line_friend_id?: string | null
          organization_id?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_line_friend_id_fkey"
            columns: ["line_friend_id"]
            isOneToOne: false
            referencedRelation: "line_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          allowed_ips: string[] | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          organization_id: string
          permissions: Json | null
          rate_limit: number | null
          updated_at: string | null
        }
        Insert: {
          allowed_ips?: string[] | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          organization_id: string
          permissions?: Json | null
          rate_limit?: number | null
          updated_at?: string | null
        }
        Update: {
          allowed_ips?: string[] | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          permissions?: Json | null
          rate_limit?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          id: string
          ip_address: unknown
          organization_id: string
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          organization_id: string
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          organization_id?: string
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_response_rules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          match_type: string | null
          name: string
          organization_id: string
          priority: number | null
          response_content: Json
          response_type: string
          trigger_config: Json | null
          trigger_keywords: string[] | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          match_type?: string | null
          name: string
          organization_id: string
          priority?: number | null
          response_content: Json
          response_type: string
          trigger_config?: Json | null
          trigger_keywords?: string[] | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          match_type?: string | null
          name?: string
          organization_id?: string
          priority?: number | null
          response_content?: Json
          response_type?: string
          trigger_config?: Json | null
          trigger_keywords?: string[] | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auto_response_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_steps: {
        Row: {
          condition: Json | null
          created_at: string | null
          delay_unit: string
          delay_value: number
          id: string
          message_content: Json
          message_type: string
          name: string
          step_campaign_id: string
          step_number: number
          updated_at: string | null
        }
        Insert: {
          condition?: Json | null
          created_at?: string | null
          delay_unit: string
          delay_value: number
          id?: string
          message_content: Json
          message_type: string
          name: string
          step_campaign_id: string
          step_number: number
          updated_at?: string | null
        }
        Update: {
          condition?: Json | null
          created_at?: string | null
          delay_unit?: string
          delay_value?: number
          id?: string
          message_content?: Json
          message_type?: string
          name?: string
          step_campaign_id?: string
          step_number?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_steps_step_campaign_id_fkey"
            columns: ["step_campaign_id"]
            isOneToOne: false
            referencedRelation: "step_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          message_type: string
          metadata: Json | null
          organization_id: string
          sender_type: string
          sent_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          metadata?: Json | null
          organization_id: string
          sender_type: string
          sent_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_type?: string
          metadata?: Json | null
          organization_id?: string
          sender_type?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "line_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          last_message_content: string | null
          line_friend_id: string
          metadata: Json | null
          organization_id: string
          status: string | null
          tags: string[] | null
          unread_count: number | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_content?: string | null
          line_friend_id: string
          metadata?: Json | null
          organization_id: string
          status?: string | null
          tags?: string[] | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          last_message_content?: string | null
          line_friend_id?: string
          metadata?: Json | null
          organization_id?: string
          status?: string | null
          tags?: string[] | null
          unread_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_line_friend_id_fkey"
            columns: ["line_friend_id"]
            isOneToOne: false
            referencedRelation: "line_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      form_fields: {
        Row: {
          created_at: string | null
          display_order: number
          field_type: string
          form_id: string
          id: string
          is_required: boolean | null
          label: string
          options: Json | null
          placeholder: string | null
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string | null
          display_order: number
          field_type: string
          form_id: string
          id?: string
          is_required?: boolean | null
          label: string
          options?: Json | null
          placeholder?: string | null
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          field_type?: string
          form_id?: string
          id?: string
          is_required?: boolean | null
          label?: string
          options?: Json | null
          placeholder?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_responses: {
        Row: {
          created_at: string | null
          form_id: string
          id: string
          ip_address: unknown
          line_friend_id: string | null
          responses: Json
          submitted_at: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          form_id: string
          id?: string
          ip_address?: unknown
          line_friend_id?: string | null
          responses: Json
          submitted_at?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          form_id?: string
          id?: string
          ip_address?: unknown
          line_friend_id?: string | null
          responses?: Json
          submitted_at?: string | null
          user_agent?: string | null
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
            foreignKeyName: "form_responses_line_friend_id_fkey"
            columns: ["line_friend_id"]
            isOneToOne: false
            referencedRelation: "line_friends"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          organization_id: string
          settings: Json | null
          status: string
          title: string
          total_responses: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          organization_id: string
          settings?: Json | null
          status?: string
          title: string
          total_responses?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          organization_id?: string
          settings?: Json | null
          status?: string
          title?: string
          total_responses?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_tags: {
        Row: {
          created_at: string | null
          id: string
          line_friend_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          line_friend_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          line_friend_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_tags_line_friend_id_fkey"
            columns: ["line_friend_id"]
            isOneToOne: false
            referencedRelation: "line_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          organization_id: string
          role: string
          status: string
          token: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id: string
          role: string
          status?: string
          token?: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id?: string
          role?: string
          status?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      line_channels: {
        Row: {
          channel_access_token: string
          channel_id: string
          channel_secret: string
          created_at: string | null
          id: string
          name: string
          organization_id: string
          picture_url: string | null
          settings: Json | null
          status: string
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          channel_access_token: string
          channel_id: string
          channel_secret: string
          created_at?: string | null
          id?: string
          name: string
          organization_id: string
          picture_url?: string | null
          settings?: Json | null
          status?: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          channel_access_token?: string
          channel_id?: string
          channel_secret?: string
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string
          picture_url?: string | null
          settings?: Json | null
          status?: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "line_channels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      line_friends: {
        Row: {
          created_at: string | null
          custom_fields: Json | null
          display_name: string | null
          first_followed_at: string
          follow_status: string
          id: string
          language: string | null
          last_followed_at: string | null
          last_interaction_at: string | null
          line_channel_id: string
          line_user_id: string
          organization_id: string
          picture_url: string | null
          status_message: string | null
          total_messages_received: number | null
          total_messages_sent: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_fields?: Json | null
          display_name?: string | null
          first_followed_at?: string
          follow_status?: string
          id?: string
          language?: string | null
          last_followed_at?: string | null
          last_interaction_at?: string | null
          line_channel_id: string
          line_user_id: string
          organization_id: string
          picture_url?: string | null
          status_message?: string | null
          total_messages_received?: number | null
          total_messages_sent?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_fields?: Json | null
          display_name?: string | null
          first_followed_at?: string
          follow_status?: string
          id?: string
          language?: string | null
          last_followed_at?: string | null
          last_interaction_at?: string | null
          line_channel_id?: string
          line_user_id?: string
          organization_id?: string
          picture_url?: string | null
          status_message?: string | null
          total_messages_received?: number | null
          total_messages_sent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "line_friends_line_channel_id_fkey"
            columns: ["line_channel_id"]
            isOneToOne: false
            referencedRelation: "line_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_friends_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_recipients: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          line_friend_id: string
          message_id: string
          read_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          line_friend_id: string
          message_id: string
          read_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          line_friend_id?: string
          message_id?: string
          read_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_recipients_line_friend_id_fkey"
            columns: ["line_friend_id"]
            isOneToOne: false
            referencedRelation: "line_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_recipients_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          click_count: number | null
          completed_at: string | null
          content: Json
          created_at: string | null
          created_by: string | null
          delivered_count: number | null
          error_count: number | null
          id: string
          line_channel_id: string
          organization_id: string
          read_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string
          target_ids: string[] | null
          target_type: string
          total_recipients: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          click_count?: number | null
          completed_at?: string | null
          content: Json
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          error_count?: number | null
          id?: string
          line_channel_id: string
          organization_id: string
          read_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          target_ids?: string[] | null
          target_type: string
          total_recipients?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          click_count?: number | null
          completed_at?: string | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          error_count?: number | null
          id?: string
          line_channel_id?: string
          organization_id?: string
          read_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          target_ids?: string[] | null
          target_type?: string
          total_recipients?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_line_channel_id_fkey"
            columns: ["line_channel_id"]
            isOneToOne: false
            referencedRelation: "line_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          line_channel_access_token: string | null
          line_channel_secret: string | null
          name: string
          plan: string
          settings: Json | null
          slug: string
          status: string
          subscription_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          line_channel_access_token?: string | null
          line_channel_secret?: string | null
          name: string
          plan?: string
          settings?: Json | null
          slug: string
          status?: string
          subscription_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          line_channel_access_token?: string | null
          line_channel_secret?: string | null
          name?: string
          plan?: string
          settings?: Json | null
          slug?: string
          status?: string
          subscription_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reservation_types: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservation_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          confirmed_at: string | null
          created_at: string | null
          custom_data: Json | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          line_friend_id: string | null
          notes: string | null
          organization_id: string
          reminder_sent_at: string | null
          reservation_type_id: string | null
          schedule_id: string
          schedule_slot_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          custom_data?: Json | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          line_friend_id?: string | null
          notes?: string | null
          organization_id: string
          reminder_sent_at?: string | null
          reservation_type_id?: string | null
          schedule_id: string
          schedule_slot_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          custom_data?: Json | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          line_friend_id?: string | null
          notes?: string | null
          organization_id?: string
          reminder_sent_at?: string | null
          reservation_type_id?: string | null
          schedule_id?: string
          schedule_slot_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_line_friend_id_fkey"
            columns: ["line_friend_id"]
            isOneToOne: false
            referencedRelation: "line_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_reservation_type_id_fkey"
            columns: ["reservation_type_id"]
            isOneToOne: false
            referencedRelation: "reservation_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_schedule_slot_id_fkey"
            columns: ["schedule_slot_id"]
            isOneToOne: false
            referencedRelation: "schedule_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      rich_menu_areas: {
        Row: {
          action_data: Json
          action_type: string
          bounds_height: number
          bounds_width: number
          bounds_x: number
          bounds_y: number
          created_at: string | null
          id: string
          rich_menu_id: string
        }
        Insert: {
          action_data: Json
          action_type: string
          bounds_height: number
          bounds_width: number
          bounds_x: number
          bounds_y: number
          created_at?: string | null
          id?: string
          rich_menu_id: string
        }
        Update: {
          action_data?: Json
          action_type?: string
          bounds_height?: number
          bounds_width?: number
          bounds_x?: number
          bounds_y?: number
          created_at?: string | null
          id?: string
          rich_menu_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rich_menu_areas_rich_menu_id_fkey"
            columns: ["rich_menu_id"]
            isOneToOne: false
            referencedRelation: "rich_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      rich_menus: {
        Row: {
          chat_bar_text: string
          created_at: string | null
          id: string
          image_url: string
          is_default: boolean | null
          line_channel_id: string
          line_rich_menu_id: string | null
          name: string
          organization_id: string
          size_height: number
          size_width: number
          status: string
          updated_at: string | null
        }
        Insert: {
          chat_bar_text: string
          created_at?: string | null
          id?: string
          image_url: string
          is_default?: boolean | null
          line_channel_id: string
          line_rich_menu_id?: string | null
          name: string
          organization_id: string
          size_height: number
          size_width?: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          chat_bar_text?: string
          created_at?: string | null
          id?: string
          image_url?: string
          is_default?: boolean | null
          line_channel_id?: string
          line_rich_menu_id?: string | null
          name?: string
          organization_id?: string
          size_height?: number
          size_width?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rich_menus_line_channel_id_fkey"
            columns: ["line_channel_id"]
            isOneToOne: false
            referencedRelation: "line_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rich_menus_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_slots: {
        Row: {
          booked_count: number | null
          capacity: number | null
          created_at: string | null
          end_time: string
          id: string
          schedule_id: string
          start_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          booked_count?: number | null
          capacity?: number | null
          created_at?: string | null
          end_time: string
          id?: string
          schedule_id: string
          start_time: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          booked_count?: number | null
          capacity?: number | null
          created_at?: string | null
          end_time?: string
          id?: string
          schedule_id?: string
          start_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_slots_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          booking_url: string | null
          buffer_minutes: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_public: boolean | null
          max_bookings_per_slot: number | null
          name: string
          organization_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          booking_url?: string | null
          buffer_minutes?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          is_public?: boolean | null
          max_bookings_per_slot?: number | null
          name: string
          organization_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          booking_url?: string | null
          buffer_minutes?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_public?: boolean | null
          max_bookings_per_slot?: number | null
          name?: string
          organization_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      segment_conditions: {
        Row: {
          created_at: string | null
          field: string
          id: string
          logic_operator: string
          operator: string
          segment_id: string
          value: Json
        }
        Insert: {
          created_at?: string | null
          field: string
          id?: string
          logic_operator?: string
          operator: string
          segment_id: string
          value: Json
        }
        Update: {
          created_at?: string | null
          field?: string
          id?: string
          logic_operator?: string
          operator?: string
          segment_id?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "segment_conditions_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      segments: {
        Row: {
          created_at: string | null
          description: string | null
          estimated_count: number | null
          id: string
          name: string
          organization_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          estimated_count?: number | null
          id?: string
          name: string
          organization_id: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          estimated_count?: number | null
          id?: string
          name?: string
          organization_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "segments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      step_campaign_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_step_number: number
          id: string
          line_friend_id: string
          next_send_at: string | null
          started_at: string | null
          status: string
          step_campaign_id: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_step_number?: number
          id?: string
          line_friend_id: string
          next_send_at?: string | null
          started_at?: string | null
          status?: string
          step_campaign_id: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_step_number?: number
          id?: string
          line_friend_id?: string
          next_send_at?: string | null
          started_at?: string | null
          status?: string
          step_campaign_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "step_campaign_logs_line_friend_id_fkey"
            columns: ["line_friend_id"]
            isOneToOne: false
            referencedRelation: "line_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_campaign_logs_step_campaign_id_fkey"
            columns: ["step_campaign_id"]
            isOneToOne: false
            referencedRelation: "step_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      step_campaigns: {
        Row: {
          active_subscribers: number | null
          completed_subscribers: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          line_channel_id: string
          name: string
          organization_id: string
          status: string
          total_subscribers: number | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          active_subscribers?: number | null
          completed_subscribers?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          line_channel_id: string
          name: string
          organization_id: string
          status?: string
          total_subscribers?: number | null
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          active_subscribers?: number | null
          completed_subscribers?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          line_channel_id?: string
          name?: string
          organization_id?: string
          status?: string
          total_subscribers?: number | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "step_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_campaigns_line_channel_id_fkey"
            columns: ["line_channel_id"]
            isOneToOne: false
            referencedRelation: "line_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      url_clicks: {
        Row: {
          clicked_at: string | null
          id: string
          ip_address: unknown
          line_friend_id: string | null
          referrer: string | null
          url_mapping_id: string
          user_agent: string | null
        }
        Insert: {
          clicked_at?: string | null
          id?: string
          ip_address?: unknown
          line_friend_id?: string | null
          referrer?: string | null
          url_mapping_id: string
          user_agent?: string | null
        }
        Update: {
          clicked_at?: string | null
          id?: string
          ip_address?: unknown
          line_friend_id?: string | null
          referrer?: string | null
          url_mapping_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "url_clicks_line_friend_id_fkey"
            columns: ["line_friend_id"]
            isOneToOne: false
            referencedRelation: "line_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "url_clicks_url_mapping_id_fkey"
            columns: ["url_mapping_id"]
            isOneToOne: false
            referencedRelation: "url_mappings"
            referencedColumns: ["id"]
          },
        ]
      }
      url_mappings: {
        Row: {
          click_count: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          message_id: string | null
          organization_id: string
          original_url: string
          short_code: string
          unique_click_count: number | null
          updated_at: string | null
        }
        Insert: {
          click_count?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message_id?: string | null
          organization_id: string
          original_url: string
          short_code: string
          unique_click_count?: number | null
          updated_at?: string | null
        }
        Update: {
          click_count?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message_id?: string | null
          organization_id?: string
          original_url?: string
          short_code?: string
          unique_click_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "url_mappings_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "url_mappings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organizations: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_organizations_user_id_users_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string
          full_name: string | null
          id: string
          last_login_at: string | null
          last_login_ip: unknown | null
          locale: string | null
          notification_settings: Json | null
          organization_id: string
          phone_number: string | null
          preferences: Json | null
          role: string
          status: string
          timezone: string | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          full_name?: string | null
          id: string
          last_login_at?: string | null
          last_login_ip?: unknown | null
          locale?: string | null
          notification_settings?: Json | null
          organization_id: string
          phone_number?: string | null
          preferences?: Json | null
          role?: string
          status?: string
          timezone?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          last_login_ip?: unknown | null
          locale?: string | null
          notification_settings?: Json | null
          organization_id?: string
          phone_number?: string | null
          preferences?: Json | null
          role?: string
          status?: string
          timezone?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          line_channel_id: string | null
          payload: Json
          processed_at: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          line_channel_id?: string | null
          payload: Json
          processed_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          line_channel_id?: string | null
          payload?: Json
          processed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_line_channel_id_fkey"
            columns: ["line_channel_id"]
            isOneToOne: false
            referencedRelation: "line_channels"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
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
  public: {
    Enums: {},
  },
} as const
