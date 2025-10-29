import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function SegmentListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-full mt-2"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 bg-muted rounded-full"></div>
              <div className="h-8 bg-muted rounded w-20"></div>
            </div>
            <div className="h-6 bg-muted rounded w-24"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="flex gap-2 pt-2">
              <div className="h-9 bg-muted rounded flex-1"></div>
              <div className="h-9 bg-muted rounded flex-1"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
