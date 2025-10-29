import { ReportBuilder } from '@/components/analytics/ReportBuilder'

export default function NewReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">新規レポート作成</h1>
        <p className="text-muted-foreground mt-2">
          レポートテンプレートを作成します
        </p>
      </div>

      <ReportBuilder mode="create" />
    </div>
  )
}
