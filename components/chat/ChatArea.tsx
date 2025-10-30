'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { ChatMessage, sendMessage, markMessagesAsRead } from '@/app/actions/chat'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface ChatAreaProps {
  friendId: string
  friendName: string
  friendAvatar?: string | null
  initialMessages: ChatMessage[]
}

export function ChatArea({ friendId, friendName, friendAvatar, initialMessages }: ChatAreaProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Mark messages as read when opening chat
    const markAsRead = async () => {
      try {
        await markMessagesAsRead(friendId)
      } catch (error) {
        console.error('Failed to mark messages as read:', error)
      }
    }
    markAsRead()
  }, [friendId])

  const handleSendMessage = async (content: string) => {
    try {
      const newMessage = await sendMessage(friendId, content)
      setMessages((prev) => [...prev, newMessage])
      router.refresh()
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          {friendAvatar ? (
            <img
              src={friendAvatar}
              alt={friendName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <UserCircleIcon className="h-7 w-7 text-gray-500" />
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-900">{friendName}</h2>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <UserCircleIcon className="h-16 w-16 mb-4" />
            <p className="text-sm">まだメッセージがありません</p>
            <p className="text-xs mt-1">最初のメッセージを送信してみましょう</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  )
}
