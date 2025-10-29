'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ConversationDetail, ConversationHistory, ScenarioStep } from '@/types/auto-response'
import { ChatBubbleLeftIcon, ChatBubbleLeftRightIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface ConversationTimelineProps {
  conversationId: string
  open: boolean
  onClose: () => void
}

export function ConversationTimeline({ conversationId, open, onClose }: ConversationTimelineProps) {
  const [conversationDetail, setConversationDetail] = useState<ConversationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (open && conversationId) {
      loadConversationDetail()
    }
  }, [open, conversationId])

  const loadConversationDetail = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement API call to fetch conversation detail
      // const response = await fetch(`/api/auto-response/conversations/${conversationId}`)
      // const data = await response.json()
      // setConversationDetail(data)

      // Mock data for now
      setConversationDetail({
        conversation: {
          id: conversationId,
          user_id: 'user-123',
          friend_id: 'friend-123',
          friend_name: '山田太郎',
          scenario_id: 'scenario-123',
          scenario_name: '商品案内シナリオ',
          current_step: 3,
          total_steps: 5,
          status: 'active',
          started_at: new Date(Date.now() - 3600000).toISOString(),
          last_interaction_at: new Date(Date.now() - 300000).toISOString(),
          expires_at: new Date(Date.now() + 86400000).toISOString(),
        },
        history: [
          {
            id: '1',
            conversation_id: conversationId,
            step_number: 1,
            step_name: '挨拶',
            user_input: null,
            system_response: 'こんにちは！商品についてご案内いたします。',
            branch_taken: null,
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: '2',
            conversation_id: conversationId,
            step_number: 2,
            step_name: '興味確認',
            user_input: 'はい、興味があります',
            system_response: 'ありがとうございます！どのような商品をお探しですか？',
            branch_taken: 'interested',
            created_at: new Date(Date.now() - 1800000).toISOString(),
          },
          {
            id: '3',
            conversation_id: conversationId,
            step_number: 3,
            step_name: '詳細案内',
            user_input: 'Aプランについて教えてください',
            system_response: 'Aプランの詳細をご案内します。月額1,000円で...（続く）',
            branch_taken: 'plan_a',
            created_at: new Date(Date.now() - 300000).toISOString(),
          },
        ],
        scenario: {
          id: 'scenario-123',
          name: '商品案内シナリオ',
          description: '新規顧客向けの商品案内フロー',
          steps: [
            {
              step_number: 1,
              name: '挨拶',
              message: 'こんにちは！商品についてご案内いたします。',
              branches: [],
            },
            {
              step_number: 2,
              name: '興味確認',
              message: 'ご興味はございますか？',
              branches: [
                { condition: 'interested', next_step: 3, action: 'tag_add:interested' },
                { condition: 'not_interested', next_step: null, action: 'tag_add:not_interested' },
              ],
            },
            {
              step_number: 3,
              name: '詳細案内',
              message: 'どのプランについてお知りになりたいですか？',
              branches: [
                { condition: 'plan_a', next_step: 4, action: null },
                { condition: 'plan_b', next_step: 5, action: null },
              ],
            },
          ],
        },
      })
    } catch (error) {
      console.error('Failed to load conversation detail:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>会話履歴を読み込み中...</DialogTitle>
          </DialogHeader>
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!conversationDetail) {
    return null
  }

  const { conversation, history, scenario } = conversationDetail

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>会話履歴タイムライン</DialogTitle>
          <DialogDescription>
            {conversation.friend_name} - {conversation.scenario_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Conversation Overview */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
              <Badge>{conversation.status === 'active' ? 'アクティブ' : '完了'}</Badge>
            </div>
            {scenario.description && (
              <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
            )}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                ステップ {conversation.current_step} / {conversation.total_steps}
              </span>
              <span>
                進捗: {Math.round((conversation.current_step / conversation.total_steps) * 100)}%
              </span>
            </div>
          </Card>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            <div className="space-y-6">
              {history.map((item, index) => {
                const isLastItem = index === history.length - 1
                const scenarioStep = scenario.steps.find(s => s.step_number === item.step_number)

                return (
                  <div key={item.id} className="relative pl-16">
                    {/* Step Number Circle */}
                    <div className={`absolute left-4 -translate-x-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold text-sm ${
                      isLastItem
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-600'
                    }`}>
                      {item.step_number}
                    </div>

                    {/* Step Content */}
                    <div className="space-y-3">
                      {/* Step Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.step_name}</h4>
                          <p className="text-xs text-gray-500">
                            {format(new Date(item.created_at), 'yyyy/MM/dd HH:mm:ss', { locale: ja })}
                          </p>
                        </div>
                        {item.branch_taken && (
                          <Badge variant="outline" className="text-xs">
                            分岐: {item.branch_taken}
                          </Badge>
                        )}
                      </div>

                      {/* User Input (if exists) */}
                      {item.user_input && (
                        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <ChatBubbleLeftIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-blue-900 mb-1">ユーザー入力</p>
                            <p className="text-sm text-gray-900">{item.user_input}</p>
                          </div>
                        </div>
                      )}

                      {/* System Response */}
                      <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-green-900 mb-1">システム応答</p>
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{item.system_response}</p>
                        </div>
                      </div>

                      {/* Branch Options (if exists) */}
                      {scenarioStep && scenarioStep.branches.length > 0 && (
                        <div className="pl-8 space-y-2">
                          <p className="text-xs font-medium text-gray-600">分岐オプション:</p>
                          {scenarioStep.branches.map((branch, branchIndex) => {
                            const isTaken = branch.condition === item.branch_taken
                            return (
                              <div
                                key={branchIndex}
                                className={`flex items-center gap-2 p-2 rounded ${
                                  isTaken ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50'
                                }`}
                              >
                                <ArrowRightIcon className={`h-4 w-4 ${isTaken ? 'text-blue-600' : 'text-gray-400'}`} />
                                <span className={`text-sm ${isTaken ? 'font-medium text-blue-900' : 'text-gray-600'}`}>
                                  {branch.condition}
                                  {branch.next_step && ` → ステップ ${branch.next_step}`}
                                </span>
                                {isTaken && <CheckCircleIcon className="h-4 w-4 text-blue-600 ml-auto" />}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Next Step Preview (if active) */}
            {conversation.status === 'active' && conversation.current_step < conversation.total_steps && (
              <div className="relative pl-16 mt-6">
                <div className="absolute left-4 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-400">
                  {conversation.current_step + 1}
                </div>
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    次のステップを待っています...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Conversation Info */}
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">開始日時:</span>
              <p className="font-medium">
                {format(new Date(conversation.started_at), 'yyyy/MM/dd HH:mm:ss', { locale: ja })}
              </p>
            </div>
            <div>
              <span className="text-gray-600">最終操作:</span>
              <p className="font-medium">
                {format(new Date(conversation.last_interaction_at), 'yyyy/MM/dd HH:mm:ss', { locale: ja })}
              </p>
            </div>
            {conversation.expires_at && (
              <div className="col-span-2">
                <span className="text-gray-600">有効期限:</span>
                <p className="font-medium">
                  {format(new Date(conversation.expires_at), 'yyyy/MM/dd HH:mm:ss', { locale: ja })}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
