'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LogDetailDialog } from './LogDetailDialog'
import { ResponseLog, ResponseRuleType, ResponseStatus } from '@/types/auto-response'
import { CheckCircleIcon, XCircleIcon, ClockIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface ResponseLogsTableProps {
  logs: ResponseLog[]
  onFilterChange?: (filters: {
    ruleType?: ResponseRuleType
    status?: ResponseStatus
    keyword?: string
  }) => void
}

export function ResponseLogsTable({ logs, onFilterChange }: ResponseLogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<ResponseLog | null>(null)
  const [ruleTypeFilter, setRuleTypeFilter] = useState<ResponseRuleType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ResponseStatus | 'all'>('all')
  const [keywordSearch, setKeywordSearch] = useState('')

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (ruleTypeFilter !== 'all' && log.rule_type !== ruleTypeFilter) return false
    if (statusFilter !== 'all' && log.status !== statusFilter) return false
    if (keywordSearch && !log.received_message.toLowerCase().includes(keywordSearch.toLowerCase())) {
      return false
    }
    return true
  })

  const handleRuleTypeChange = (value: string) => {
    const newValue = value as ResponseRuleType | 'all'
    setRuleTypeFilter(newValue)
    onFilterChange?.({
      ruleType: newValue === 'all' ? undefined : newValue,
      status: statusFilter === 'all' ? undefined : statusFilter,
      keyword: keywordSearch || undefined,
    })
  }

  const handleStatusChange = (value: string) => {
    const newValue = value as ResponseStatus | 'all'
    setStatusFilter(newValue)
    onFilterChange?.({
      ruleType: ruleTypeFilter === 'all' ? undefined : ruleTypeFilter,
      status: newValue === 'all' ? undefined : newValue,
      keyword: keywordSearch || undefined,
    })
  }

  const handleKeywordSearch = (value: string) => {
    setKeywordSearch(value)
    onFilterChange?.({
      ruleType: ruleTypeFilter === 'all' ? undefined : ruleTypeFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
      keyword: value || undefined,
    })
  }

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
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />
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

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>応答ログ</CardTitle>
          <CardDescription>自動応答の実行履歴</CardDescription>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="キーワード検索..."
                  value={keywordSearch}
                  onChange={(e) => handleKeywordSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={ruleTypeFilter} onValueChange={handleRuleTypeChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="ルールタイプ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのタイプ</SelectItem>
                <SelectItem value="keyword">キーワード</SelectItem>
                <SelectItem value="regex">正規表現</SelectItem>
                <SelectItem value="ai">AI</SelectItem>
                <SelectItem value="scenario">シナリオ</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのステータス</SelectItem>
                <SelectItem value="success">成功</SelectItem>
                <SelectItem value="failed">失敗</SelectItem>
                <SelectItem value="processing">処理中</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日時</TableHead>
                  <TableHead>友だち名</TableHead>
                  <TableHead>ルール</TableHead>
                  <TableHead>タイプ</TableHead>
                  <TableHead>受信メッセージ</TableHead>
                  <TableHead>応答内容</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="text-right">応答時間</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      ログが見つかりません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => {
                    const ruleTypeBadge = getRuleTypeBadge(log.rule_type)
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                        </TableCell>
                        <TableCell>{log.friend_name}</TableCell>
                        <TableCell>{log.rule_name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={ruleTypeBadge.variant}>
                            {ruleTypeBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          {truncateText(log.received_message)}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          {truncateText(log.sent_response)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <span className="text-sm">{getStatusText(log.status)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {log.response_time_ms}ms
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            詳細
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              {filteredLogs.length}件のログを表示中
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      {selectedLog && (
        <LogDetailDialog
          log={selectedLog}
          open={!!selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </>
  )
}
