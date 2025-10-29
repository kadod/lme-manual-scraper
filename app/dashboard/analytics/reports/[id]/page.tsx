import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReportPreview } from '@/components/analytics/ReportPreview'
import { ReportHistory } from '@/components/analytics/ReportHistory'
import { getReport, getReportHistory, generateReport } from '@/app/actions/custom-reports'
import {
  PencilIcon,
  PlayIcon,
  ClockIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface ReportPageProps {
  params: Promise<{
    id: string
  }>
}

async function ReportDetailWrapper({ id }: { id: string }) {
  try {
    const [report, history] = await Promise.all([
      getReport(id),
      getReportHistory(id),
    ])

    const getStatusBadge = (status: typeof report.status) => {
      const variants = {
        active: { label: '有効', variant: 'default' as const },
        inactive: { label: '無効', variant: 'secondary' as const },
        draft: { label: '下書き', variant: 'outline' as const },
      }
      const { label, variant } = variants[status]
      return <Badge variant={variant}>{label}</Badge>
    }

    const getFormatLabel = (format: typeof report.format) => {
      const labels = {
        pdf: 'PDF',
        csv: 'CSV',
        excel: 'Excel',
      }
      return labels[format]
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-2xl">{report.name}</CardTitle>
                  {getStatusBadge(report.status)}
                  <Badge variant="outline">{getFormatLabel(report.format)}</Badge>
                </div>
                {report.description && (
                  <CardDescription className="text-base">
                    {report.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-2">
                <form
                  action={async () => {
                    'use server'
                    await generateReport(id)
                  }}
                >
                  <Button size="sm" type="submit">
                    <PlayIcon className="size-4" />
                    生成実行
                  </Button>
                </form>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/dashboard/analytics/reports/${id}/edit`}>
                    <PencilIcon className="size-4" />
                    編集
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">最終生成</p>
                <div className="flex items-center gap-2">
                  <ClockIcon className="size-5 text-muted-foreground" />
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
                <p className="text-sm text-muted-foreground mb-2">次回実行予定</p>
                <div className="flex items-center gap-2">
                  <ClockIcon className="size-5 text-muted-foreground" />
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
              {report.schedule && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">メール送信先</p>
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="size-5 text-muted-foreground" />
                    <span>{report.schedule.emailRecipients.length} 件</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList>
            <TabsTrigger value="preview">プレビュー</TabsTrigger>
            <TabsTrigger value="history">履歴</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-6">
            <ReportPreview report={report} />
          </TabsContent>
          <TabsContent value="history" className="mt-6">
            <ReportHistory history={history} reportId={id} />
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    notFound()
  }
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params

  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="text-center py-12 text-muted-foreground">
            読み込み中...
          </div>
        }
      >
        <ReportDetailWrapper id={id} />
      </Suspense>
    </div>
  )
}
