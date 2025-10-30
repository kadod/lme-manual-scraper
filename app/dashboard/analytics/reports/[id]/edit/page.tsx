import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { ReportBuilder } from '@/components/analytics/ReportBuilder'
import { getCustomReport } from '@/app/actions/custom-reports'
import type { CustomReport } from '@/types/custom-reports'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface EditReportPageProps {
  params: Promise<{
    id: string
  }>
}

async function ReportBuilderWrapper({ id }: { id: string }) {
  // Feature not yet available - show placeholder
  // TODO: Uncomment when database migrations are run
  /*
  try {
    const report = await getCustomReport(id)
    return <ReportBuilder report={report} mode="edit" />
  } catch (error) {
    notFound()
  }
  */

  return (
    <Card>
      <CardHeader>
        <CardTitle>機能準備中</CardTitle>
        <CardDescription>
          カスタムレポート機能は現在開発中です
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          データベースマイグレーションの実行後に利用可能になります。
        </p>
      </CardContent>
    </Card>
  )
}

export default async function EditReportPage({ params }: EditReportPageProps) {
  const { id } = await params

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">レポート編集</h1>
        <p className="text-muted-foreground mt-2">
          レポートテンプレートを編集します
        </p>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-12 text-muted-foreground">
            読み込み中...
          </div>
        }
      >
        <ReportBuilderWrapper id={id} />
      </Suspense>
    </div>
  )
}
