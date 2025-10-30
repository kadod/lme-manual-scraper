'use client'

import { UserCircleIcon, TagIcon, CalendarIcon, PhoneIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

interface FriendDetailSidebarProps {
  friend: {
    id: string
    display_name: string | null
    picture_url: string | null
    follow_status: string
    language: string | null
    first_followed_at: string | null
    last_interaction_at: string | null
    custom_fields?: Record<string, any> | null
  }
}

export function FriendDetailSidebar({ friend }: FriendDetailSidebarProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return format(new Date(dateString), 'yyyy年M月d日', { locale: ja })
  }

  const getStatusBadge = (followStatus: string) => {
    switch (followStatus) {
      case 'following':
        return <Badge className="bg-green-100 text-green-700">フォロー中</Badge>
      case 'blocked':
        return <Badge className="bg-red-100 text-red-700">ブロック中</Badge>
      case 'unfollowed':
        return <Badge className="bg-gray-100 text-gray-700">フォロー解除</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">{followStatus}</Badge>
    }
  }

  return (
    <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
      {/* Profile Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col items-center">
          {friend.picture_url ? (
            <img
              src={friend.picture_url}
              alt={friend.display_name || 'User'}
              className="h-24 w-24 rounded-full object-cover mb-4"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center mb-4">
              <UserCircleIcon className="h-16 w-16 text-gray-500" />
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {friend.display_name || '名前なし'}
          </h3>
          {getStatusBadge(friend.follow_status)}
        </div>
      </div>

      {/* Basic Info Section */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">基本情報</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">友だち追加日</p>
              <p className="text-sm text-gray-900">{formatDate(friend.first_followed_at)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">最終やりとり</p>
              <p className="text-sm text-gray-900">{formatDate(friend.last_interaction_at)}</p>
            </div>
          </div>
          {friend.language && (
            <div className="flex items-start gap-3">
              <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">言語</p>
                <p className="text-sm text-gray-900">{friend.language}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tags Section */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TagIcon className="h-5 w-5" />
          タグ
        </h4>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            タグなし
          </Badge>
        </div>
      </div>

      {/* Custom Fields Section */}
      {friend.custom_fields && Object.keys(friend.custom_fields).length > 0 && (
        <div className="p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">カスタムフィールド</h4>
          <div className="space-y-3">
            {Object.entries(friend.custom_fields).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs text-gray-500 mb-1">{key}</p>
                <p className="text-sm text-gray-900">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
