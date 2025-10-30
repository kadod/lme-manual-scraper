'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  MagnifyingGlassIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'

interface Conversation {
  id: string
  friendId: string
  friendName: string
  friendAvatar: string
  status: 'unread' | 'read'
  lastMessage: string
  timestamp: string
  hasReply: boolean
}

export default function ChatManagementPage() {
  const [viewMode, setViewMode] = useState<'all' | 'unread' | 'narrowed'>('unread')
  const [showOnlyReplies, setShowOnlyReplies] = useState(false)
  const [selectedConversations, setSelectedConversations] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<'all' | 'custom'>('all')
  const [bulkStatus, setBulkStatus] = useState<'read' | 'unread'>('read')

  // Mock data
  const conversations: Conversation[] = [
    {
      id: '1',
      friendId: 'user1',
      friendName: 'Yuta Hijikata',
      friendAvatar: '/avatars/user1.jpg',
      status: 'unread',
      lastMessage: '承知いたしました！引続きよろしくお願いいたします！',
      timestamp: '2025/10/29 13:49',
      hasReply: false,
    },
    {
      id: '2',
      friendId: 'user2',
      friendName: 'Yuta Hijikata',
      friendAvatar: '/avatars/user2.jpg',
      status: 'unread',
      lastMessage: '土方です！',
      timestamp: '2025/10/29 10:31',
      hasReply: false,
    },
    {
      id: '3',
      friendId: 'user3',
      friendName: '樋口 友規',
      friendAvatar: '/avatars/user3.jpg',
      status: 'unread',
      lastMessage: '【画像】',
      timestamp: '2025/10/29 09:11',
      hasReply: false,
    },
    {
      id: '4',
      friendId: 'user4',
      friendName: '樋口 友規',
      friendAvatar: '/avatars/user4.jpg',
      status: 'unread',
      lastMessage: '11/4 16:30から予約しました！ maemukiからの紹介の旨は どのタイ...',
      timestamp: '2025/10/29 09:06',
      hasReply: false,
    },
  ]

  const toggleConversation = (id: string) => {
    setSelectedConversations((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    )
  }

  const handleBulkStatusChange = () => {
    console.log(`Changing ${selectedConversations.length} conversations to ${bulkStatus}`)
    setSelectedConversations([])
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">チャット管理</h2>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="メッセージ検索"
            className="pl-10 max-w-md"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={viewMode === 'all' ? 'secondary' : 'outline'}
            onClick={() => setViewMode('all')}
          >
            一覧
          </Button>
          <Button
            variant={viewMode === 'unread' ? 'default' : 'outline'}
            onClick={() => setViewMode('unread')}
            className={viewMode === 'unread' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            未確認のみ
          </Button>
          <Button
            variant={viewMode === 'narrowed' ? 'default' : 'outline'}
            onClick={() => setViewMode('narrowed')}
            className={viewMode === 'narrowed' ? 'bg-blue-500 hover:bg-blue-600' : ''}
          >
            絞り込み
          </Button>

          <div className="flex items-center space-x-2 ml-4">
            <Checkbox
              id="replies-only"
              checked={showOnlyReplies}
              onCheckedChange={(checked) => setShowOnlyReplies(!!checked)}
            />
            <Label htmlFor="replies-only" className="text-sm font-normal">
              返信を含める
            </Label>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" className="bg-gray-500 text-white hover:bg-gray-600">
              全期間
            </Button>
            <Button variant="outline">
              <CalendarIcon className="h-5 w-5 mr-2" />
              表示期間
            </Button>
            <span className="text-sm text-gray-600">から</span>
            <Button variant="outline">
              <CalendarIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Conversation List */}
      <div className="bg-white rounded-lg border">
        {/* Table Header */}
        <div className="bg-green-600 text-white p-4 grid grid-cols-12 gap-4 items-center font-medium">
          <div className="col-span-1 text-center">
            ページ内選択
          </div>
          <div className="col-span-2">ステータス</div>
          <div className="col-span-2">受信日時</div>
          <div className="col-span-3">LINE名</div>
          <div className="col-span-3">メッセージ内容</div>
          <div className="col-span-1"></div>
        </div>

        {/* Conversation Rows */}
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="p-4 border-b last:border-b-0 grid grid-cols-12 gap-4 items-center hover:bg-gray-50"
          >
            <div className="col-span-1 flex justify-center">
              <Checkbox
                checked={selectedConversations.includes(conversation.id)}
                onCheckedChange={() => toggleConversation(conversation.id)}
              />
            </div>
            <div className="col-span-2">
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                未確認
              </Badge>
            </div>
            <div className="col-span-2 text-sm text-gray-700">
              {conversation.timestamp}
            </div>
            <div className="col-span-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {conversation.friendName.charAt(0)}
                </span>
              </div>
              <span className="font-medium">{conversation.friendName}</span>
            </div>
            <div className="col-span-3 text-sm text-gray-700 truncate">
              {conversation.lastMessage}
            </div>
            <div className="col-span-1">
              <Button variant="outline" size="sm" className="bg-gray-400 text-white hover:bg-gray-500">
                詳細
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <span className="font-medium">ステータス一括変更</span>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="bulk-read"
              name="bulk-status"
              value="read"
              checked={bulkStatus === 'read'}
              onChange={(e) => setBulkStatus(e.target.value as 'read' | 'unread')}
              className="w-4 h-4"
            />
            <Label htmlFor="bulk-read" className="font-normal">確認済</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="bulk-unread"
              name="bulk-status"
              value="unread"
              checked={bulkStatus === 'unread'}
              onChange={(e) => setBulkStatus(e.target.value as 'read' | 'unread')}
              className="w-4 h-4"
            />
            <Label htmlFor="bulk-unread" className="font-normal">未確認</Label>
          </div>
          <Button
            onClick={handleBulkStatusChange}
            disabled={selectedConversations.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            変更
          </Button>
        </div>
      </div>
    </div>
  )
}
