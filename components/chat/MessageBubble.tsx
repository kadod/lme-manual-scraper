'use client'

import { cn } from '@/lib/utils'
import { ChatMessage } from '@/app/actions/chat'
import { format } from 'date-fns'

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender_type === 'user'
  const time = format(new Date(message.sent_at), 'HH:mm')

  return (
    <div className={cn('flex mb-4', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[70%]', isUser ? 'order-2' : 'order-1')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2 shadow-sm',
            isUser
              ? 'bg-green-500 text-white rounded-br-none'
              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <div className={cn('flex items-center gap-1 mt-1 px-1', isUser ? 'justify-end' : 'justify-start')}>
          <span className="text-xs text-gray-500">{time}</span>
          {isUser && message.is_read && <span className="text-xs text-gray-500">既読</span>}
        </div>
      </div>
    </div>
  )
}
