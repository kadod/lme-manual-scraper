'use client'

import { useState } from 'react'
import { Message } from '@/app/actions/messages'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  EllipsisVerticalIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  EyeIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { MessageStats } from './MessageStats'
import { useRouter } from 'next/navigation'

interface MessageTableProps {
  messages: Message[]
  onPreview: (message: Message) => void
  onDelete: (message: Message) => void
  onDuplicate: (messageId: string) => void
  onCancel: (messageId: string) => void
}

export function MessageTable({
  messages,
  onPreview,
  onDelete,
  onDuplicate,
  onCancel,
}: MessageTableProps) {
  const router = useRouter()

  const getStatusBadge = (status: string) => {
    const configs: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
    > = {
      draft: { label: '下書き', variant: 'secondary' },
      scheduled: { label: '予約中', variant: 'default' },
      sending: { label: '配信中', variant: 'default' },
      sent: { label: '完了', variant: 'outline' },
      failed: { label: '失敗', variant: 'destructive' },
      cancelled: { label: 'キャンセル', variant: 'secondary' },
    }

    const config = configs[status] || { label: status, variant: 'secondary' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      text: 'テキスト',
      image: '画像',
      video: '動画',
      flex: 'Flex',
      template: 'テンプレート',
    }
    return <Badge variant="outline">{labels[type] || type}</Badge>
  }

  const getTargetLabel = (targetType: string, targetValue: string | null) => {
    if (targetType === 'all') return 'すべての友だち'
    if (targetType === 'segment') return `セグメント: ${targetValue}`
    if (targetType === 'tags') return `タグ: ${targetValue}`
    return targetType
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return format(new Date(dateString), 'yyyy/MM/dd HH:mm', { locale: ja })
  }

  const canEdit = (status: string) => status === 'draft'
  const canCancel = (status: string) => status === 'scheduled'

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500 mb-4">メッセージがありません</p>
        <Button onClick={() => router.push('/dashboard/messages/new')}>
          新規メッセージを作成
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>タイトル</TableHead>
            <TableHead>タイプ</TableHead>
            <TableHead>配信先</TableHead>
            <TableHead>ステータス</TableHead>
            <TableHead>配信日時</TableHead>
            <TableHead>統計</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message) => (
            <TableRow key={message.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">
                <button
                  onClick={() => onPreview(message)}
                  className="text-left hover:text-blue-600 hover:underline"
                >
                  {message.title}
                </button>
                <div className="text-xs text-gray-500 mt-1">
                  {format(new Date(message.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                </div>
              </TableCell>
              <TableCell>{getTypeBadge(message.type)}</TableCell>
              <TableCell className="text-sm">
                {getTargetLabel(message.target_type, message.target_value)}
              </TableCell>
              <TableCell>{getStatusBadge(message.status)}</TableCell>
              <TableCell className="text-sm">
                {message.status === 'scheduled' && message.scheduled_at
                  ? formatDate(message.scheduled_at)
                  : message.sent_at
                  ? formatDate(message.sent_at)
                  : '-'}
              </TableCell>
              <TableCell>
                <MessageStats stats={message.stats} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <EllipsisVerticalIcon className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onPreview(message)}>
                      <EyeIcon className="w-4 h-4 mr-2" />
                      プレビュー
                    </DropdownMenuItem>
                    {canEdit(message.status) && (
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/messages/${message.id}`)}
                      >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        編集
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onDuplicate(message.id)}>
                      <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                      複製
                    </DropdownMenuItem>
                    {canCancel(message.status) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onCancel(message.id)}
                          className="text-orange-600"
                        >
                          <XCircleIcon className="w-4 h-4 mr-2" />
                          配信をキャンセル
                        </DropdownMenuItem>
                      </>
                    )}
                    {canEdit(message.status) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(message)}
                          className="text-red-600"
                        >
                          <TrashIcon className="w-4 h-4 mr-2" />
                          削除
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
