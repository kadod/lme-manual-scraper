'use client'

import { useEffect } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function FriendsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Friends page error:', error)
  }, [error])

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="h-8 w-8 text-destructive" />
              <div>
                <CardTitle>エラーが発生しました</CardTitle>
                <CardDescription>
                  友だちリストの読み込み中に問題が発生しました
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                {error.message || '不明なエラーが発生しました'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={reset} className="flex-1">
                再試行
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/dashboard')}
                className="flex-1"
              >
                ダッシュボードに戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
