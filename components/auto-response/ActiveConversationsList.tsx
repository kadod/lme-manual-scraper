'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ConversationTimeline } from './ConversationTimeline'
import { ActiveConversation, ConversationStatus } from '@/types/auto-response'
import { ChatBubbleLeftRightIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface ActiveConversationsListProps {
  conversations: ActiveConversation[]
  onViewDetails?: (conversationId: string) => void
}

export function ActiveConversationsList({ conversations, onViewDetails }: ActiveConversationsListProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  const getStatusBadge = (status: ConversationStatus) => {
    const config: Record<ConversationStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'アクティブ', variant: 'default' },
      completed: { label: '完了', variant: 'secondary' },
      expired: { label: '期限切れ', variant: 'destructive' },
      abandoned: { label: '放棄', variant: 'outline' },
      timeout: { label: 'タイムアウト', variant: 'destructive' },
      cancelled: { label: 'キャンセル', variant: 'outline' },
    }
    return config[status] || config.active
  }

  const getStatusIcon = (status: ConversationStatus) => {
    switch (status) {
      case 'active':
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'expired':
      case 'timeout':
        return <ClockIcon className="h-5 w-5 text-red-600" />
      case 'abandoned':
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-gray-600" />
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
    }
  }

  const getProgress = (conversation: ActiveConversation) => {
    return Math.round((conversation.current_step / conversation.total_steps) * 100)
  }

  const handleViewDetails = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    onViewDetails?.(conversationId)
  }

  // Group by status
  const activeConversations = conversations.filter(c => c.status === 'active')
  const completedConversations = conversations.filter(c => c.status === 'completed')
  const otherConversations = conversations.filter(c => c.status !== 'active' && c.status !== 'completed')

  return (
    <div className="space-y-6">
      {/* Active Conversations */}
      {activeConversations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              アクティブな会話
            </CardTitle>
            <CardDescription>
              {activeConversations.length}件の進行中の会話
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeConversations.map((conversation) => {
                const statusBadge = getStatusBadge(conversation.status)
                const progress = getProgress(conversation)

                return (
                  <div
                    key={conversation.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(conversation.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">
                              {conversation.friend_name}
                            </h4>
                            <Badge variant={statusBadge.variant} className="text-xs">
                              {statusBadge.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{conversation.scenario_name}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(conversation.id)}
                      >
                        詳細
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          ステップ {conversation.current_step} / {conversation.total_steps}
                        </span>
                        <span className="font-semibold text-blue-600">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>
                          開始: {formatDistanceToNow(new Date(conversation.started_at), {
                            addSuffix: true,
                            locale: ja,
                          })}
                        </span>
                      </div>
                      <span>
                        最終操作: {formatDistanceToNow(new Date(conversation.last_interaction_at), {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </span>
                    </div>

                    {conversation.expires_at && (
                      <div className="mt-2 text-xs text-orange-600">
                        期限: {formatDistanceToNow(new Date(conversation.expires_at), {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Conversations */}
      {completedConversations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              完了した会話
            </CardTitle>
            <CardDescription>
              {completedConversations.length}件の完了した会話
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedConversations.map((conversation) => {
                const statusBadge = getStatusBadge(conversation.status)

                return (
                  <div
                    key={conversation.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(conversation.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {conversation.friend_name}
                            </span>
                            <Badge variant={statusBadge.variant} className="text-xs">
                              {statusBadge.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{conversation.scenario_name}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(conversation.id)}
                      >
                        詳細
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Status Conversations */}
      {otherConversations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>その他の会話</CardTitle>
            <CardDescription>
              期限切れまたは放棄された会話
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {otherConversations.map((conversation) => {
                const statusBadge = getStatusBadge(conversation.status)

                return (
                  <div
                    key={conversation.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getStatusIcon(conversation.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {conversation.friend_name}
                            </span>
                            <Badge variant={statusBadge.variant} className="text-xs">
                              {statusBadge.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{conversation.scenario_name}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(conversation.id)}
                      >
                        詳細
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {conversations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">アクティブな会話はありません</p>
          </CardContent>
        </Card>
      )}

      {/* Timeline Dialog */}
      {selectedConversationId && (
        <ConversationTimeline
          conversationId={selectedConversationId}
          open={!!selectedConversationId}
          onClose={() => setSelectedConversationId(null)}
        />
      )}
    </div>
  )
}
