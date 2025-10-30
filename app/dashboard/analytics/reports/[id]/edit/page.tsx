import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { ReportBuilder } from '@/components/analytics/ReportBuilder'
import { getCustomReport } from '@/app/actions/custom-reports'

interface EditReportPageProps {
  params: Promise<{
    id: string
  }>
}

async function ReportBuilderWrapper({ id }: { id: string }) {
  try {
    const report = await getCustomReport(id)
    return <ReportBuilder report={report} mode="edit" />
  } catch (error) {
    notFound()
  }
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
