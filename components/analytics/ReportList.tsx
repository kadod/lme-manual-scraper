'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DocumentChartBarIcon,
  ClockIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import type { CustomReport } from '@/types/custom-reports'
import { deleteCustomReport, executeReport } from '@/app/actions/custom-reports'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface ReportListProps {
  reports: CustomReport[]
}

export function ReportList({ reports }: ReportListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('このレポートを削除してもよろしいですか?')) {
      return
    }

    setDeletingId(id)
    try {
      await deleteCustomReport(id)
      toast.success('レポートを削除しました')
    } catch (error) {
      toast.error('レポートの削除に失敗しました')
      console.error(error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleGenerate = async (id: string) => {
    setGeneratingId(id)
    try {
      await executeReport(id)
      toast.success('レポートの生成を開始しました')
    } catch (error) {
      toast.error('レポートの生成に失敗しました')
      console.error(error)
    } finally {
      setGeneratingId(null)
    }
  }

  const getStatusBadge = (status: CustomReport['status']) => {
    const variants = {
      active: { label: '有効', variant: 'default' as const },
      inactive: { label: '無効', variant: 'secondary' as const },
      draft: { label: '下書き', variant: 'outline' as const },
    }
    const { label, variant } = variants[status]
    return <Badge variant={variant}>{label}</Badge>
  }

  const getFormatLabel = (format: CustomReport['format']) => {
    const labels = {
      pdf: 'PDF',
      csv: 'CSV',
      excel: 'Excel',
    }
    return labels[format]
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <DocumentChartBarIcon className="size-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">レポートが登録されていません</p>
          <Button asChild>
            <Link href="/dashboard/analytics/reports/new">
              <PlusIcon className="size-4" />
              新規作成
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle>
                    <Link
                      href={`/dashboard/analytics/reports/${report.id}`}
                      className="hover:underline"
                    >
                      {report.name}
                    </Link>
                  </CardTitle>
                  {getStatusBadge(report.status)}
                  <Badge variant="outline">{getFormatLabel(report.format)}</Badge>
                </div>
                {report.description && (
                  <CardDescription>{report.description}</CardDescription>
                )}
              </div>
              <CardAction>
                <div className="flex gap-2">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => handleGenerate(report.id)}
                    disabled={generatingId === report.id}
                  >
                    <PlayIcon className="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    asChild
                  >
                    <Link href={`/dashboard/analytics/reports/${report.id}/edit`}>
                      <PencilIcon className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => handleDelete(report.id)}
                    disabled={deletingId === report.id}
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              </CardAction>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">最終生成</p>
                <div className="flex items-center gap-1">
                  <ClockIcon className="size-4 text-muted-foreground" />
                  <span>
                    {report.lastGenerated
                      ? formatDistanceToNow(new Date(report.lastGenerated), {
                          addSuffix: true,
                          locale: ja,
                        })
                      : '未生成'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">次回実行</p>
                <div className="flex items-center gap-1">
                  <ClockIcon className="size-4 text-muted-foreground" />
                  <span>
                    {report.nextScheduled
                      ? formatDistanceToNow(new Date(report.nextScheduled), {
                          addSuffix: true,
                          locale: ja,
                        })
                      : 'スケジュールなし'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">頻度</p>
                <span>
                  {report.schedule
                    ? {
                        manual: '手動のみ',
                        daily: '毎日',
                        weekly: '毎週',
                        monthly: '毎月',
                        custom: 'カスタム',
                      }[report.schedule.frequency]
                    : '-'}
                </span>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">含まれる指標</p>
                <span>
                  {Object.values(report.metrics).filter(Boolean).length} 項目
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
