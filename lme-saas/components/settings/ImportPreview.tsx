'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ImportPreviewProps {
  data: {
    totalRows: number
    validRows: number
    invalidRows: number
    sampleData: any[]
    errors: { row: number; message: string }[]
  }
  type: 'friends' | 'tags'
}

export function ImportPreview({ data, type }: ImportPreviewProps) {
  const columns = type === 'friends'
    ? ['display_name', 'line_user_id', 'email', 'phone']
    : ['name', 'description']

  const columnLabels: Record<string, string> = {
    display_name: '表示名',
    line_user_id: 'LINE ユーザーID',
    email: 'メールアドレス',
    phone: '電話番号',
    name: 'タグ名',
    description: '説明',
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>インポートプレビュー</CardTitle>
          <CardDescription>
            ファイルの内容を確認してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">{data.totalRows}</p>
              <p className="text-sm text-gray-600">合計行数</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <p className="text-2xl font-bold text-green-600">{data.validRows}</p>
              </div>
              <p className="text-sm text-gray-600">有効行</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                <p className="text-2xl font-bold text-red-600">{data.invalidRows}</p>
              </div>
              <p className="text-sm text-gray-600">エラー行</p>
            </div>
          </div>

          {data.errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">エラー一覧</p>
              <div className="space-y-1">
                {data.errors.slice(0, 5).map((error, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <Badge variant="destructive" className="shrink-0">
                      行 {error.row}
                    </Badge>
                    <span className="text-gray-700">{error.message}</span>
                  </div>
                ))}
                {data.errors.length > 5 && (
                  <p className="text-xs text-gray-500">
                    他 {data.errors.length - 5} 件のエラーがあります
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-2">データサンプル（最初の5行）</p>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    {columns.map((column) => (
                      <TableHead key={column}>{columnLabels[column]}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sampleData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      {columns.map((column) => (
                        <TableCell key={column}>
                          {row[column] || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
