import { Suspense } from 'react'
import { FunnelIcon, PlusIcon } from '@heroicons/react/24/outline'
import { SegmentList } from '@/components/friends/SegmentList'
import { SegmentListSkeleton } from '@/components/friends/SegmentListSkeleton'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'セグメント管理 | L Message',
  description: '友だちセグメントを管理',
}

export default function SegmentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FunnelIcon className="h-8 w-8" />
            セグメント管理
          </h1>
          <p className="text-muted-foreground mt-2">
            条件を組み合わせて友だちグループを作成
          </p>
        </div>
      </div>

      {/* Segment List */}
      <Suspense fallback={<SegmentListSkeleton />}>
        <SegmentList />
      </Suspense>
    </div>
  )
}
