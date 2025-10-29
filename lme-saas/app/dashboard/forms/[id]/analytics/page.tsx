import { Suspense } from 'react'
import { getFormAnalyticsAction, getTextFieldWordsAction } from '@/app/actions/forms'
import { AnalyticsDashboard } from '@/components/forms/AnalyticsDashboard'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="space-y-6">
        <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-80 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}

async function AnalyticsContent({ formId }: { formId: string }) {
  try {
    // Fetch analytics data
    const analytics = await getFormAnalyticsAction(formId, 30)

    if (!analytics.form) {
      notFound()
    }

    // Fetch word cloud data for text fields
    const wordCloudData: Record<string, Array<{ text: string; value: number }>> = {}
    for (const field of analytics.form.fields) {
      if (field.type === 'text' || field.type === 'textarea') {
        try {
          const words = await getTextFieldWordsAction(formId, field.id, 50)
          if (words.length > 0) {
            wordCloudData[field.id] = words
          }
        } catch (error) {
          console.error(`Failed to fetch word cloud for field ${field.id}:`, error)
        }
      }
    }

    return (
      <AnalyticsDashboard
        formId={formId}
        analytics={analytics}
        wordCloudData={wordCloudData}
      />
    )
  } catch (error) {
    console.error('Failed to load analytics:', error)
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-red-500 mb-4">分析データの読み込みに失敗しました</p>
        <Button onClick={() => window.location.reload()}>再読み込み</Button>
      </div>
    )
  }
}

export default async function FormAnalyticsPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/forms/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              フォームに戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">フォーム分析</h1>
            <p className="text-gray-500 mt-1">回答データの詳細な分析とインサイト</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/dashboard/forms/${id}/responses`}>
            <Button variant="outline">回答一覧</Button>
          </Link>
          <Link href={`/dashboard/forms/${id}/export`}>
            <Button>CSVエクスポート</Button>
          </Link>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent formId={id} />
      </Suspense>
    </div>
  )
}
