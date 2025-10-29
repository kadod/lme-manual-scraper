'use client'

import { ClockIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Action {
  id: string
  action_type: string
  description: string | null
  metadata: Record<string, any> | null
  created_at: string
}

interface ActionHistoryProps {
  actions: Action[]
}

export function ActionHistory({ actions }: ActionHistoryProps) {
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'tag_added':
        return '🏷️'
      case 'tag_removed':
        return '🗑️'
      case 'status_changed':
        return '🔄'
      case 'field_updated':
        return '✏️'
      case 'message_sent':
        return '📤'
      case 'form_submitted':
        return '📝'
      default:
        return '📋'
    }
  }

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'tag_added':
        return 'タグ追加'
      case 'tag_removed':
        return 'タグ削除'
      case 'status_changed':
        return 'ステータス変更'
      case 'field_updated':
        return 'フィールド更新'
      case 'message_sent':
        return 'メッセージ送信'
      case 'form_submitted':
        return 'フォーム送信'
      default:
        return actionType
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5" />
          アクション履歴
          <Badge variant="secondary" className="ml-auto">
            {actions.length}件
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            アクション履歴はありません
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="flex gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="text-2xl">{getActionIcon(action.action_type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getActionLabel(action.action_type)}
                      </Badge>
                    </div>
                    {action.description && (
                      <p className="text-sm">{action.description}</p>
                    )}
                    {action.metadata && Object.keys(action.metadata).length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {JSON.stringify(action.metadata, null, 2)
                          .split('\n')
                          .slice(0, 3)
                          .join('\n')}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(action.created_at), 'yyyy年MM月dd日 HH:mm', {
                        locale: ja,
                      })}
                    </p>
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
