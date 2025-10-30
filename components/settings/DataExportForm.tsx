'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { exportData } from '@/app/actions/system'
import { useToast } from '@/hooks/use-toast'

import type { ExportFormat } from '@/types/system'

type DataType = 'friends' | 'tags' | 'segments' | 'messages' | 'forms' | 'reservations' | 'analytics'

export function DataExportForm() {
  const { toast } = useToast()
  const [selectedData, setSelectedData] = useState<DataType[]>([])
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState(0)

  const dataTypes: { value: DataType; label: string }[] = [
    { value: 'friends', label: '友だちリスト' },
    { value: 'tags', label: 'タグ' },
    { value: 'segments', label: 'セグメント' },
    { value: 'messages', label: 'メッセージ履歴' },
    { value: 'forms', label: 'フォーム回答' },
    { value: 'reservations', label: '予約データ' },
    { value: 'analytics', label: '分析データ' },
  ]

  const handleDataTypeToggle = (dataType: DataType) => {
    setSelectedData((prev) =>
      prev.includes(dataType)
        ? prev.filter((d) => d !== dataType)
        : [...prev, dataType]
    )
  }

  const handleExport = async () => {
    if (selectedData.length === 0) {
      toast.error('エクスポート対象を選択してください')
      return
    }

    setIsExporting(true)
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 300)

      const result = await exportData({
        dataTypes: selectedData,
        format,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (result.success && result.fileUrl && result.fileName) {
        // Download the file
        const a = document.createElement('a')
        a.href = result.fileUrl
        a.download = result.fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        toast.success(`${result.fileName}をダウンロードしました（${result.recordCount || 0}件）`)
      } else {
        throw new Error(result.error || 'エクスポートに失敗しました')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'エクスポートに失敗しました')
    } finally {
      setIsExporting(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base font-semibold">エクスポート対象</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {dataTypes.map((dataType) => (
            <div key={dataType.value} className="flex items-center space-x-2">
              <Checkbox
                id={dataType.value}
                checked={selectedData.includes(dataType.value)}
                onCheckedChange={() => handleDataTypeToggle(dataType.value)}
                disabled={isExporting}
              />
              <Label
                htmlFor={dataType.value}
                className="text-sm font-normal cursor-pointer"
              >
                {dataType.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">形式</Label>
        <RadioGroup
          value={format}
          onValueChange={(value) => setFormat(value as ExportFormat)}
          disabled={isExporting}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="csv" id="csv" />
            <Label htmlFor="csv" className="font-normal cursor-pointer">
              CSV (カンマ区切り)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="json" id="json" />
            <Label htmlFor="json" className="font-normal cursor-pointer">
              JSON (構造化データ)
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">期間</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date" className="text-sm">
              開始日
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isExporting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date" className="text-sm">
              終了日
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isExporting}
            />
          </div>
        </div>
      </div>

      {isExporting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">エクスポート中...</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      <Button
        onClick={handleExport}
        disabled={isExporting || selectedData.length === 0}
        className="w-full"
      >
        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
        {isExporting ? 'エクスポート中...' : 'エクスポート開始'}
      </Button>
    </div>
  )
}
