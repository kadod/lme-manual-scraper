'use client'

import { useEffect, useState } from 'react'
import { UsersIcon } from '@heroicons/react/24/outline'
import { Card, CardContent } from '@/components/ui/card'
import { previewSegment } from '@/app/actions/segments'
import { SegmentCondition } from '@/lib/supabase/queries/segments'

interface SegmentPreviewProps {
  conditions: SegmentCondition[]
}

export function SegmentPreview({ conditions }: SegmentPreviewProps) {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (conditions.length === 0) {
      setCount(null)
      return
    }

    const timer = setTimeout(() => {
      loadPreview()
    }, 500) // Debounce 500ms

    return () => clearTimeout(timer)
  }, [conditions])

  const loadPreview = async () => {
    setLoading(true)
    const result = await previewSegment(conditions)
    if (result.success) {
      setCount(result.data)
    } else {
      setCount(0)
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <UsersIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">該当友だち数</p>
              <p className="text-3xl font-bold">
                {loading ? (
                  <span className="animate-pulse">計算中...</span>
                ) : count !== null ? (
                  <span>{count.toLocaleString()}</span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
                {count !== null && !loading && <span className="text-lg ml-1">人</span>}
              </p>
            </div>
          </div>

          {!loading && count !== null && count > 0 && (
            <div className="text-sm text-muted-foreground">
              リアルタイムプレビュー
            </div>
          )}
        </div>

        {!loading && count === 0 && conditions.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
            この条件に一致する友だちはいません。条件を調整してください。
          </div>
        )}
      </CardContent>
    </Card>
  )
}
