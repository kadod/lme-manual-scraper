'use client'

import { ConversationList } from './ConversationList'
import { ConversationPreview } from '@/app/actions/chat'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface ChatLayoutProps {
  conversations: ConversationPreview[]
  children: React.ReactNode
}

export function ChatLayout({ conversations, children }: ChatLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = conversations.filter((conversation) => {
    const name = conversation.display_name?.toLowerCase() || ''
    const lastMessage = conversation.last_message?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    return name.includes(query) || lastMessage.includes(query)
  })

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar - Conversation List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="友だちを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-hidden">
          <ConversationList conversations={filteredConversations} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {children}
      </div>
    </div>
  )
}
