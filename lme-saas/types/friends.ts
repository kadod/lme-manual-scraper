export interface LineFriend {
  id: string
  organization_id: string
  channel_id: string | null
  line_user_id: string
  display_name: string | null
  picture_url: string | null
  status: 'active' | 'blocked' | 'unsubscribed'
  language: string | null
  custom_fields: Record<string, any> | null
  first_added_at: string | null
  last_interaction_at: string | null
  created_at: string
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
