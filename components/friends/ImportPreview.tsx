'use client'

import { ImportPreviewRow } from '@/types/import'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface ImportPreviewProps {
  previewData: ImportPreviewRow[]
  totalRows: number
  errorCount: number
}

export function ImportPreview({ previewData, totalRows, errorCount }: ImportPreviewProps) {
  const validRows = previewData.filter((row) => row.errors.length === 0)
  const invalidRows = previewData.filter((row) => row.errors.length > 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総データ行数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRows}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">インポート可能</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalRows - errorCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">エラー</CardTitle>
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Summary */}
      {errorCount > 0 && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">
                {errorCount}件のエラーが検出されました
              </p>
              <p className="text-sm">
                エラーがある行はインポートされません。CSVファイルを修正してから再度アップロードしてください。
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle>プレビュー（最初10行）</CardTitle>
          <CardDescription>
            インポートされるデータの確認
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">行</TableHead>
                    <TableHead>LINE User ID</TableHead>
                    <TableHead>表示名</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>言語</TableHead>
                    <TableHead className="text-right">検証結果</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row) => (
                    <TableRow
                      key={row.row}
                      className={row.errors.length > 0 ? 'bg-red-50' : ''}
                    >
                      <TableCell className="font-medium">{row.row}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {row.line_user_id || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{row.display_name || '-'}</TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell>
                        {row.language || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.errors.length === 0 ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            OK
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            {row.errors.length}件のエラー
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Error Details */}
          {invalidRows.length > 0 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-red-600">エラー詳細</h4>
              <div className="space-y-3">
                {invalidRows.map((row) => (
                  <div
                    key={row.row}
                    className="rounded-lg border border-red-200 bg-red-50 p-4"
                  >
                    <p className="font-medium text-sm mb-2">
                      行 {row.row}: {row.display_name || row.line_user_id}
                    </p>
                    <ul className="space-y-1">
                      {row.errors.map((error, i) => (
                        <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>
                            <span className="font-medium">{error.column}:</span>{' '}
                            {error.message}
                            {error.value && (
                              <span className="text-red-600 ml-1">
                                (値: {error.value})
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {previewData.length < totalRows && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              ... 他 {totalRows - previewData.length} 行
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-muted-foreground">-</span>

  const variants: Record<string, { label: string; className: string }> = {
    active: { label: '有効', className: 'bg-green-50 text-green-700 border-green-200' },
    blocked: { label: 'ブロック', className: 'bg-gray-50 text-gray-700 border-gray-200' },
    unsubscribed: {
      label: '配信停止',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
  }

  const variant = variants[status] || variants.active

  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  )
}
