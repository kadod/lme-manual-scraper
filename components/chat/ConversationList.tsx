'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ConversationPreview } from '@/app/actions/chat'
import { format, formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { Badge } from '@/components/ui/badge'

interface ConversationListProps {
  conversations: ConversationPreview[]
}

export function ConversationList({ conversations }: ConversationListProps) {
  const pathname = usePathname()

  const formatTime = (dateString: string | null) => {
    if (!dateString) return ''

    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return format(date, 'HH:mm')
    } else if (diffInHours < 24 * 7) {
      return formatDistanceToNow(date, { locale: ja, addSuffix: false })
    } else {
      return format(date, 'M/d')
    }
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <UserCircleIcon className="h-16 w-16 mb-4" />
        <p className="text-sm">会話がありません</p>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((conversation) => {
        const isActive = pathname === `/dashboard/chat/${conversation.id}`

        return (
          <Link
            key={conversation.id}
            href={`/dashboard/chat/${conversation.id}`}
            className={cn(
              'block border-b border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors',
              isActive && 'bg-green-50 hover:bg-green-50'
            )}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {conversation.picture_url ? (
                  <img
                    src={conversation.picture_url}
                    alt={conversation.display_name || 'User'}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserCircleIcon className="h-8 w-8 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-sm text-gray-900 truncate">
                    {conversation.display_name || '名前なし'}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {formatTime(conversation.last_message_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.last_message || 'メッセージなし'}
                  </p>
                  {conversation.unread_count > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 flex-shrink-0">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
