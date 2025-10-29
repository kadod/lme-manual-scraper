'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Message } from '@/app/actions/messages'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface MessagePreviewDialogProps {
  message: Message | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MessagePreviewDialog({ message, open, onOpenChange }: MessagePreviewDialogProps) {
  if (!message) return null

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      scheduled: 'bg-blue-500',
      sending: 'bg-yellow-500',
      sent: 'bg-green-500',
      failed: 'bg-red-500',
      cancelled: 'bg-gray-400',
    }
    return colors[status] || 'bg-gray-500'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: '下書き',
      scheduled: '予約中',
      sending: '配信中',
      sent: '完了',
      failed: '失敗',
      cancelled: 'キャンセル',
    }
    return labels[status] || status
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: 'テキスト',
      image: '画像',
      video: '動画',
      flex: 'Flexメッセージ',
      template: 'テンプレート',
    }
    return labels[type] || type
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>メッセージプレビュー</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{message.title}</h3>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(message.status)}>
                  {getStatusLabel(message.status)}
                </Badge>
                <Badge variant="outline">{getTypeLabel(message.type)}</Badge>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">作成日時</p>
              <p className="font-medium">
                {format(new Date(message.created_at), 'PPP HH:mm', { locale: ja })}
              </p>
            </div>
            {message.scheduled_at && (
              <div>
                <p className="text-sm text-gray-600">配信予定日時</p>
                <p className="font-medium">
                  {format(new Date(message.scheduled_at), 'PPP HH:mm', { locale: ja })}
                </p>
              </div>
            )}
            {message.sent_at && (
              <div>
                <p className="text-sm text-gray-600">配信日時</p>
                <p className="font-medium">
                  {format(new Date(message.sent_at), 'PPP HH:mm', { locale: ja })}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">配信先</p>
              <p className="font-medium">
                {message.target_type === 'all' && 'すべての友だち'}
                {message.target_type === 'segment' && 'セグメント'}
                {message.target_type === 'tags' && 'タグ'}
              </p>
            </div>
          </div>

          {/* Stats */}
          {message.stats && message.stats.total_recipients > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">配信統計</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">総配信数</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {message.stats.total_recipients.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">配信率</p>
                  <p className="text-2xl font-bold text-green-600">
                    {message.stats.delivery_rate}%
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">開封率</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {message.stats.open_rate}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content Preview */}
          <div className="space-y-3">
            <h4 className="font-semibold">コンテンツ</h4>
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              {message.type === 'text' && (
                <div className="whitespace-pre-wrap">
                  {message.content?.text || 'コンテンツなし'}
                </div>
              )}
              {message.type === 'image' && (
                <div className="text-center">
                  {message.content?.originalContentUrl ? (
                    <img
                      src={message.content.originalContentUrl}
                      alt="Message preview"
                      className="max-w-full rounded"
                    />
                  ) : (
                    <p className="text-gray-500">画像プレビューなし</p>
                  )}
                </div>
              )}
              {(message.type === 'flex' || message.type === 'template') && (
                <div className="text-sm text-gray-600">
                  <pre className="overflow-auto">
                    {JSON.stringify(message.content, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
