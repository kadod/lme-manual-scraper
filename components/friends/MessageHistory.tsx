'use client'

import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Message {
  id: string
  content: string
  type: string
  status: string
  created_at: string
  sent_at: string | null
}

interface MessageHistoryProps {
  messages: Message[]
}

export function MessageHistory({ messages }: MessageHistoryProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500">送信済み</Badge>
      case 'delivered':
        return <Badge className="bg-blue-500">配信済み</Badge>
      case 'failed':
        return <Badge variant="destructive">失敗</Badge>
      case 'pending':
        return <Badge variant="secondary">送信待ち</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getMessagePreview = (content: string, type: string) => {
    if (type === 'text') {
      return content.length > 100 ? content.substring(0, 100) + '...' : content
    }
    return `[${type}メッセージ]`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          メッセージ履歴
          <Badge variant="secondary" className="ml-auto">
            {messages.length}件
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            メッセージ履歴はありません
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="p-4 border rounded-lg space-y-2 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm flex-1">
                      {getMessagePreview(message.content, message.type)}
                    </p>
                    {getStatusBadge(message.status)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {format(new Date(message.created_at), 'MM月dd日 HH:mm', {
                        locale: ja,
                      })}
                    </span>
                    {message.sent_at && (
                      <>
                        <span>•</span>
                        <span>
                          送信:{' '}
                          {format(new Date(message.sent_at), 'MM月dd日 HH:mm', {
                            locale: ja,
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
