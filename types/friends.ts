export interface LineFriend {
  id: string
  organization_id: string
  line_channel_id: string
  line_user_id: string
  display_name: string | null
  picture_url: string | null
  follow_status: string
  status_message: string | null
  language: string | null
  custom_fields: Record<string, any> | null
  first_followed_at: string
  last_followed_at: string | null
  last_interaction_at: string | null
  total_messages_sent: number | null
  total_messages_received: number | null
  created_at: string | null
  updated_at: string | null
}

export interface FriendsFilters {
  search: string
  status: 'all' | 'active' | 'blocked' | 'unsubscribed'
  lastInteractionDays: 'all' | '7' | '30' | '90'
}

export interface FriendsTableProps {
  friends: LineFriend[]
  totalCount: number
  currentPage: number
  pageSize: number
}
