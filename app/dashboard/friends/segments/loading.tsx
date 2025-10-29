import { SegmentListSkeleton } from '@/components/friends/SegmentListSkeleton'

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-muted rounded animate-pulse"></div>
          <div className="h-5 w-96 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
      <SegmentListSkeleton />
    </div>
  )
}
