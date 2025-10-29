import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>

        {/* Stepper Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </div>
                {step < 3 && <Skeleton className="flex-1 h-0.5 mx-4" />}
              </div>
            ))}
          </div>
          <Skeleton className="h-2 w-full" />
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-96 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}
