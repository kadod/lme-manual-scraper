'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { AuditLogDetailDialog } from './AuditLogDetailDialog'
import { getAuditLogs } from '@/app/actions/system'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { AuditLog } from '@/types/system'

interface AuditLogsTableProps {
  initialLogs: {
    logs: AuditLog[]
    total: number
    page: number
    limit: number
  }
}

export function AuditLogsTable({ initialLogs }: AuditLogsTableProps) {
  const [logs, setLogs] = useState(initialLogs.logs)
  const [total, setTotal] = useState(initialLogs.total)
  const [page, setPage] = useState(initialLogs.page)
  const [limit] = useState(initialLogs.limit)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const totalPages = Math.ceil(total / limit)

  const loadLogs = async (newPage: number) => {
    setIsLoading(true)
    try {
      const result = await getAuditLogs({
        page: newPage,
        limit,
        search: searchQuery || undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
      })
      setLogs(result.logs)
      setTotal(result.total)
      setPage(result.page)
    } catch (error) {
      console.error('Failed to load logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    loadLogs(1)
  }

  const handleFilterChange = (value: string) => {
    setActionFilter(value)
    setPage(1)
  }

  const getActionBadgeVariant = (action: string): 'default' | 'secondary' | 'destructive' => {
    if (action.includes('delete') || action.includes('remove')) return 'destructive'
    if (action.includes('create') || action.includes('add')) return 'default'
    return 'secondary'
  }

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      'user.login': 'ログイン',
      'user.logout': 'ログアウト',
      'message.sent': 'メッセージ送信',
      'message.deleted': 'メッセージ削除',
      'friend.created': '友だち追加',
      'friend.updated': '友だち更新',
      'friend.deleted': '友だち削除',
      'settings.updated': '設定変更',
      'api_key.created': 'APIキー作成',
      'api_key.deleted': 'APIキー削除',
      'form.created': 'フォーム作成',
      'form.updated': 'フォーム更新',
      'reservation.created': '予約作成',
      'reservation.cancelled': '予約キャンセル',
    }
    return labels[action] || action
  }

  const getResourceTypeLabel = (resourceType: string): string => {
    const labels: Record<string, string> = {
      user: 'ユーザー',
      message: 'メッセージ',
      friend: '友だち',
      organization: '組織',
      api_key: 'APIキー',
      form: 'フォーム',
      reservation: '予約',
      settings: '設定',
    }
    return labels[resourceType] || resourceType
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="ユーザー名やアクションで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            <MagnifyingGlassIcon className="h-5 w-5" />
          </Button>
        </div>

        <Select value={actionFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべてのアクション</SelectItem>
            <SelectItem value="user.login">ログイン</SelectItem>
            <SelectItem value="message.sent">メッセージ送信</SelectItem>
            <SelectItem value="friend.created">友だち追加</SelectItem>
            <SelectItem value="friend.deleted">友だち削除</SelectItem>
            <SelectItem value="settings.updated">設定変更</SelectItem>
            <SelectItem value="api_key.created">APIキー作成</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日時</TableHead>
              <TableHead>ユーザー</TableHead>
              <TableHead>アクション</TableHead>
              <TableHead>リソース</TableHead>
              <TableHead>IPアドレス</TableHead>
              <TableHead className="text-right">詳細</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  監査ログがありません
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {formatDistanceToNow(new Date(log.created_at), {
                      addSuffix: true,
                      locale: ja,
                    })}
                  </TableCell>
                  <TableCell>
                    {log.user_id ? (
                      <span className="font-medium">{log.user_email || 'ユーザー'}</span>
                    ) : (
                      <span className="text-gray-500">システム</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {getActionLabel(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {getResourceTypeLabel(log.resource_type)}
                  </TableCell>
                  <TableCell className="text-sm font-mono text-gray-600">
                    {log.ip_address || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedLog(log)
                        setIsDetailDialogOpen(true)
                      }}
                    >
                      詳細
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {total}件中 {(page - 1) * limit + 1} - {Math.min(page * limit, total)}件を表示
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadLogs(page - 1)}
            disabled={page === 1 || isLoading}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadLogs(page + 1)}
            disabled={page === totalPages || isLoading}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AuditLogDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        log={selectedLog}
      />
    </div>
  )
}
