'use client'

import { useCallback, useState } from 'react'
import { ArrowUpTrayIcon, DocumentIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { validateCSVSize } from '@/lib/csv-parser'

interface FileUploaderProps {
  onFileSelect: (file: File, content: string) => void
}

export function FileUploader({ onFileSelect }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)

      // Validate file type
      if (!file.name.endsWith('.csv')) {
        setError('CSVファイルのみアップロード可能です')
        return
      }

      // Validate file size
      const validation = validateCSVSize(file)
      if (!validation.valid) {
        setError(validation.error || 'ファイルが無効です')
        return
      }

      try {
        // Read file content
        const content = await file.text()
        onFileSelect(file, content)
      } catch (err) {
        console.error('File read error:', err)
        setError('ファイルの読み込みに失敗しました')
      }
    },
    [onFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed p-12 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-gray-100 p-4">
            <ArrowUpTrayIcon className="h-12 w-12 text-gray-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">CSVファイルをアップロード</h3>
            <p className="text-sm text-muted-foreground">
              ファイルをドラッグ&ドロップするか、クリックして選択してください
            </p>
          </div>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            id="csv-upload"
          />

          <Button asChild variant="outline">
            <label htmlFor="csv-upload" className="cursor-pointer">
              <DocumentIcon className="h-5 w-5 mr-2" />
              ファイルを選択
            </label>
          </Button>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>最大ファイルサイズ: 50MB</p>
            <p>最大行数: 100,000行</p>
          </div>
        </div>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <DocumentIcon className="h-5 w-5 text-blue-600" />
          CSVフォーマット要件
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1 ml-7">
          <li>• 1行目はヘッダー行として扱われます</li>
          <li>• LINE User ID（必須）と表示名（必須）の列が必要です</li>
          <li>• オプション列: picture_url, language, status, カスタムフィールド</li>
          <li>• 文字コード: UTF-8推奨</li>
          <li>• ステータスは active, blocked, unsubscribed のいずれか</li>
        </ul>
      </Card>
    </div>
  )
}
