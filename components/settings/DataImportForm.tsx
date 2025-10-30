'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { ArrowUpTrayIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ImportPreview } from './ImportPreview'
import { importData, previewImport } from '@/app/actions/system'
import { useToast } from '@/hooks/use-toast'

type ImportType = 'friends' | 'tags'
type DuplicateStrategy = 'skip' | 'update' | 'error'

export function DataImportForm() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importType, setImportType] = useState<ImportType>('friends')
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy>('skip')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    setPreviewData(null)

    // Validate file type
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!['csv', 'json'].includes(extension || '')) {
      toast.error('CSVまたはJSONファイルを選択してください')
      return
    }

    // Preview the data
    setIsPreviewLoading(true)
    try {
      const text = await file.text()
      const preview = await previewImport(importType, text)
      setPreviewData(preview)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ファイルの読み込みに失敗しました')
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleImport = async () => {
    if (!selectedFile || !previewData) return

    setIsImporting(true)
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 300)

      const text = await selectedFile.text()
      const result = await importData(importType, text, duplicateStrategy)

      clearInterval(progressInterval)
      setProgress(100)

      if (result.success) {
        toast.success(`${result.importedCount}件のデータをインポートしました（スキップ: ${result.skippedCount}件、エラー: ${result.errorCount}件）`)
      } else {
        throw new Error('インポートに失敗しました')
      }

      // Reset form
      setSelectedFile(null)
      setPreviewData(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'インポートに失敗しました')
    } finally {
      setIsImporting(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base font-semibold">インポート対象</Label>
        <RadioGroup
          value={importType}
          onValueChange={(value) => {
            setImportType(value as ImportType)
            setSelectedFile(null)
            setPreviewData(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
          }}
          disabled={isImporting}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="friends" id="friends" />
            <Label htmlFor="friends" className="font-normal cursor-pointer">
              友だちリスト
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="tags" id="tags" />
            <Label htmlFor="tags" className="font-normal cursor-pointer">
              タグ
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">ファイル</Label>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="flex items-center justify-center space-x-4">
              <DocumentIcon className="h-8 w-8 text-blue-600" />
              <div className="flex-1 text-left">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null)
                  setPreviewData(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                  }
                }}
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <>
              <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                ファイルをドラッグ&ドロップ
              </p>
              <p className="text-xs text-gray-500 mb-4">または</p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
              >
                ファイルを選択
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Label htmlFor="duplicate-strategy" className="text-base font-semibold">
          重複時の処理
        </Label>
        <Select
          value={duplicateStrategy}
          onValueChange={(value) => setDuplicateStrategy(value as DuplicateStrategy)}
          disabled={isImporting}
        >
          <SelectTrigger id="duplicate-strategy">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="skip">スキップ（既存データを保持）</SelectItem>
            <SelectItem value="update">更新（既存データを上書き）</SelectItem>
            <SelectItem value="error">エラー（重複があれば中止）</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isPreviewLoading && (
        <div className="text-center py-8">
          <p className="text-gray-600">プレビューを読み込み中...</p>
        </div>
      )}

      {previewData && !isPreviewLoading && (
        <ImportPreview data={previewData} type={importType} />
      )}

      {isImporting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">インポート中...</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => {
            if (selectedFile) {
              handleFileSelect(selectedFile)
            }
          }}
          disabled={!selectedFile || isImporting || isPreviewLoading}
          className="flex-1"
        >
          プレビュー
        </Button>
        <Button
          onClick={handleImport}
          disabled={!previewData || isImporting || isPreviewLoading}
          className="flex-1"
        >
          {isImporting ? 'インポート中...' : 'インポート開始'}
        </Button>
      </div>
    </div>
  )
}
