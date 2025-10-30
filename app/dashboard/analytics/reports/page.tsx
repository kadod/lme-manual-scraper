import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { ReportList } from '@/components/analytics/ReportList'
import { getCustomReports } from '@/app/actions/custom-reports'
import { PlusIcon } from '@heroicons/react/24/outline'

async function ReportListWrapper() {
  const reports = await getCustomReports()

  return <ReportList reports={reports} />
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">カスタムレポート</h1>
          <p className="text-muted-foreground mt-2">
            レポートテンプレートを作成して、定期的にデータを出力できます
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/analytics/reports/new">
            <PlusIcon className="size-4" />
            新規作成
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-12 text-muted-foreground">
            読み込み中...
          </div>
        }
      >
        <ReportListWrapper />
      </Suspense>
    </div>
  )
}
