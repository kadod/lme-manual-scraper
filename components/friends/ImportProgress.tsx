'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { ImportResult } from '@/types/import'

interface ImportProgressProps {
  isImporting: boolean
  progress: number
  result: ImportResult | null
  onRetry?: () => void
  onComplete?: () => void
}

export function ImportProgress({
  isImporting,
  progress,
  result,
  onRetry,
  onComplete,
}: ImportProgressProps) {
  if (isImporting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>インポート中...</CardTitle>
          <CardDescription>データをインポートしています。しばらくお待ちください。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">進行状況</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
            <span>データを処理中...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return null
  }

  const successRate =
    result.totalRows > 0
      ? Math.round((result.successCount / result.totalRows) * 100)
      : 0

  return (
    <div className="space-y-6">
      {/* Result Summary */}
      {result.success ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircleIcon className="h-5 w-5 text-green-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold text-green-900">
                インポートが完了しました！
              </p>
              <p className="text-sm text-green-800">
                {result.successCount}件のデータを正常にインポートしました。
              </p>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">
                インポート中にエラーが発生しました
              </p>
              <p className="text-sm">
                {result.errorCount}件のデータでエラーが発生しました。詳細は下記をご確認ください。
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総データ行数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.totalRows}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {result.successCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {successRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">エラー</CardTitle>
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {result.errorCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">重複</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {result.duplicates?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Details */}
      {result.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>エラー詳細</CardTitle>
            <CardDescription>
              以下のデータはインポートされませんでした
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {result.errors.slice(0, 50).map((error, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-red-200 bg-red-50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      {error.row > 0 && (
                        <p className="text-xs text-muted-foreground">
                          行 {error.row}
                        </p>
                      )}
                      <p className="text-sm text-red-900">
                        <span className="font-medium">{error.column}:</span>{' '}
                        {error.message}
                      </p>
                      {error.value && (
                        <p className="text-xs text-red-700 font-mono">
                          値: {error.value}
                        </p>
                      )}
                    </div>
                    <Badge variant="destructive" className="shrink-0">
                      エラー
                    </Badge>
                  </div>
                </div>
              ))}
              {result.errors.length > 50 && (
                <p className="text-sm text-muted-foreground text-center">
                  ... 他 {result.errors.length - 50} 件のエラー
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Duplicates */}
      {result.duplicates && result.duplicates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>重複データ</CardTitle>
            <CardDescription>
              既に登録されているLINE User ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex flex-wrap gap-2">
                {result.duplicates.slice(0, 20).map((userId) => (
                  <Badge key={userId} variant="outline" className="font-mono">
                    {userId}
                  </Badge>
                ))}
                {result.duplicates.length > 20 && (
                  <Badge variant="outline">
                    +{result.duplicates.length - 20} 件
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {!result.success && onRetry && (
          <Button onClick={onRetry} variant="outline">
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            再試行
          </Button>
        )}
        {onComplete && (
          <Button onClick={onComplete}>
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            完了
          </Button>
        )}
      </div>
    </div>
  )
}
