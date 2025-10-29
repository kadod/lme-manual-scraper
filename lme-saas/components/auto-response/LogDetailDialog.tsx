'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ResponseLog, ResponseRuleType, ResponseStatus } from '@/types/auto-response'
import { CheckCircleIcon, XCircleIcon, ClockIcon, ChatBubbleLeftIcon, ChatBubbleLeftRightIcon, BoltIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface LogDetailDialogProps {
  log: ResponseLog
  open: boolean
  onClose: () => void
}

export function LogDetailDialog({ log, open, onClose }: LogDetailDialogProps) {
  const getRuleTypeBadge = (type: ResponseRuleType) => {
    const config = {
      keyword: { label: 'キーワード', variant: 'default' as const },
      regex: { label: '正規表現', variant: 'secondary' as const },
      ai: { label: 'AI', variant: 'outline' as const },
      scenario: { label: 'シナリオ', variant: 'destructive' as const },
    }
    return config[type] || config.keyword
  }

  const getStatusIcon = (status: ResponseStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />
      case 'failed':
        return <XCircleIcon className="h-6 w-6 text-red-600" />
      case 'processing':
        return <ClockIcon className="h-6 w-6 text-yellow-600" />
    }
  }

  const getStatusText = (status: ResponseStatus) => {
    switch (status) {
      case 'success':
        return '成功'
      case 'failed':
        return '失敗'
      case 'processing':
        return '処理中'
    }
  }

  const getStatusColor = (status: ResponseStatus) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      case 'processing':
        return 'text-yellow-600'
    }
  }

  const ruleTypeBadge = getRuleTypeBadge(log.rule_type)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>応答ログ詳細</DialogTitle>
          <DialogDescription>
            {format(new Date(log.created_at), 'yyyy年MM月dd日 HH:mm:ss', { locale: ja })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Overview */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(log.status)}
              <div>
                <div className={`text-lg font-semibold ${getStatusColor(log.status)}`}>
                  {getStatusText(log.status)}
                </div>
                <div className="text-sm text-gray-600">
                  応答時間: {log.response_time_ms}ms
                </div>
              </div>
            </div>
            <Badge variant={ruleTypeBadge.variant}>
              {ruleTypeBadge.label}
            </Badge>
          </div>

          {/* Friend Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">友だち情報</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">友だち名</span>
                <span className="font-medium">{log.friend_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">友だちID</span>
                <span className="font-mono text-xs">{log.friend_id}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Rule Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">マッチしたルール</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">ルール名</span>
                <span className="font-medium">{log.rule_name || '-'}</span>
              </div>
              {log.matched_keyword && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">マッチしたキーワード</span>
                  <Badge variant="secondary">{log.matched_keyword}</Badge>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Messages */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">メッセージ</h3>

            {/* Received Message */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <ChatBubbleLeftIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">受信メッセージ</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{log.received_message}</p>
              </div>
            </div>

            {/* Sent Response */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">送信応答</span>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{log.sent_response}</p>
              </div>
            </div>
          </div>

          {/* Executed Actions */}
          {log.executed_actions && log.executed_actions.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BoltIcon className="h-4 w-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900">実行されたアクション</h3>
                </div>
                <div className="space-y-2">
                  {log.executed_actions.map((action, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <CheckCircleIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-900">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Error Message */}
          {log.status === 'failed' && log.error_message && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-red-600 mb-2">エラー詳細</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-900 whitespace-pre-wrap">{log.error_message}</p>
                </div>
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">メタデータ</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">ログID</span>
                <span className="font-mono text-xs">{log.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">ルールID</span>
                <span className="font-mono text-xs">{log.rule_id || '-'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">記録日時</span>
                <span>{format(new Date(log.created_at), 'yyyy/MM/dd HH:mm:ss', { locale: ja })}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
