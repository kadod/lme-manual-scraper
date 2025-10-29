'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Subscriber {
  id: string
  line_friend: {
    id: string
    display_name: string
    picture_url?: string
  }
  current_step_number: number
  status: 'active' | 'completed' | 'cancelled'
  started_at: string
  next_send_at?: string
  completed_at?: string
}

interface SubscriberListProps {
  subscribers: Subscriber[]
  totalSteps: number
}

const statusConfig = {
  active: { label: '進行中', color: 'bg-blue-500' },
  completed: { label: '完了', color: 'bg-green-500' },
  cancelled: { label: 'キャンセル', color: 'bg-red-500' },
}

export function SubscriberList({ subscribers, totalSteps }: SubscriberListProps) {
  if (subscribers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">登録者がいません</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>登録者リスト</CardTitle>
        <p className="text-sm text-muted-foreground">
          全{subscribers.length}件
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subscribers.map((subscriber) => {
            const status = statusConfig[subscriber.status]
            const progress = totalSteps > 0
              ? Math.round((subscriber.current_step_number / totalSteps) * 100)
              : 0

            return (
              <div
                key={subscriber.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* User Info */}
                <div className="flex items-center gap-3 flex-1">
                  <Avatar>
                    <AvatarImage src={subscriber.line_friend.picture_url} />
                    <AvatarFallback>
                      {subscriber.line_friend.display_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{subscriber.line_friend.display_name}</p>
                    <p className="text-sm text-muted-foreground">
                      開始: {formatDistanceToNow(new Date(subscriber.started_at), {
                        addSuffix: true,
                        locale: ja
                      })}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      ステップ {subscriber.current_step_number} / {totalSteps}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      進捗: {progress}%
                    </div>
                  </div>

                  {/* Status */}
                  <Badge className={`${status.color} text-white`}>
                    {status.label}
                  </Badge>
                </div>

                {/* Next Send Time */}
                {subscriber.status === 'active' && subscriber.next_send_at && (
                  <div className="text-sm text-muted-foreground ml-4">
                    次回: {formatDistanceToNow(new Date(subscriber.next_send_at), {
                      addSuffix: true,
                      locale: ja
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
