'use client'

import { useEffect } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Segments page error:', error)
  }, [error])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">セグメント管理</h1>
        <p className="text-muted-foreground mt-2">
          条件を組み合わせて友だちグループを作成
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 bg-destructive/10 rounded-full mb-4">
            <ExclamationTriangleIcon className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">エラーが発生しました</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            セグメントの読み込み中に問題が発生しました。
            <br />
            もう一度お試しください。
          </p>
          <Button onClick={reset}>再試行</Button>
        </CardContent>
      </Card>
    </div>
  )
}
