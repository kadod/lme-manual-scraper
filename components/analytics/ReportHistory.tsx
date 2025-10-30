'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import type { ReportHistory as ReportHistoryType } from '@/types/custom-reports'
import { executeReport, downloadReport } from '@/app/actions/custom-reports'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface ReportHistoryProps {
  history: ReportHistoryType[]
  reportId?: string
}

export function ReportHistory({ history, reportId }: ReportHistoryProps) {
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleRegenerate = async () => {
    if (!reportId) return

    setRegeneratingId(reportId)
    try {
      await executeReport(reportId)
      toast.success('レポートの再生成を開始しました')
    } catch (error) {
      toast.error('レポートの再生成に失敗しました')
      console.error(error)
    } finally {
      setRegeneratingId(null)
    }
  }

  const handleDownload = async (historyId: string) => {
    setDownloadingId(historyId)
    try {
      const data = await downloadReport(historyId)
      // In a real implementation, this would trigger a file download
      toast.success('ダウンロードを開始しました')
      console.log('Download:', data)
    } catch (error) {
      toast.error('ダウンロードに失敗しました')
      console.error(error)
    } finally {
      setDownloadingId(null)
    }
  }

  const getStatusBadge = (status: ReportHistoryType['status']) => {
    const variants = {
      generating: { label: '生成中', variant: 'outline' as const },
      completed: { label: '完了', variant: 'default' as const },
      failed: { label: '失敗', variant: 'destructive' as const },
    }
    const { label, variant } = variants[status]
    return <Badge variant={variant}>{label}</Badge>
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFormatLabel = (format: ReportHistoryType['format']) => {
    const labels = {
      pdf: 'PDF',
      csv: 'CSV',
      excel: 'Excel',
    }
    return labels[format]
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <DocumentChartBarIcon className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            生成されたレポートはまだありません
          </p>
          {reportId && (
            <Button onClick={handleRegenerate} disabled={regeneratingId !== null}>
              <ArrowPathIcon className="size-4" />
              レポートを生成
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>レポート履歴</CardTitle>
            <CardDescription>過去に生成されたレポート一覧</CardDescription>
          </div>
          {reportId && (
            <Button
              onClick={handleRegenerate}
              disabled={regeneratingId !== null}
              size="sm"
            >
              <ArrowPathIcon className="size-4" />
              再生成
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-4 flex-1">
                <DocumentChartBarIcon className="size-5 text-muted-foreground mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{item.reportName}</p>
                    {getStatusBadge(item.status)}
                    <Badge variant="outline">{getFormatLabel(item.format)}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="size-4" />
                      <span>
                        {formatDistanceToNow(new Date(item.generatedAt), {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </span>
                    </div>
                    {item.status === 'completed' && (
                      <span>{formatFileSize(item.fileSize)}</span>
                    )}
                  </div>
                  {item.status === 'failed' && item.error && (
                    <p className="text-sm text-destructive mt-1">{item.error}</p>
                  )}
                </div>
              </div>
              {item.status === 'completed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(item.id)}
                  disabled={downloadingId === item.id}
                >
                  <ArrowDownTrayIcon className="size-4" />
                  ダウンロード
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
