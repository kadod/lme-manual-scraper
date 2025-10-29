'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import type { ExportFormat } from '@/types/analytics'

interface ExportButtonProps {
  onExport: (format: ExportFormat) => Promise<void> | void
  formats?: ExportFormat[]
  defaultFormat?: ExportFormat
  disabled?: boolean
  loading?: boolean
  className?: string
}

export function ExportButton({
  onExport,
  formats = ['csv', 'png', 'pdf'],
  defaultFormat = 'csv',
  disabled = false,
  loading = false,
  className,
}: ExportButtonProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(defaultFormat)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await onExport(selectedFormat)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const formatLabels: Record<ExportFormat, string> = {
    csv: 'CSV',
    png: 'PNG画像',
    pdf: 'PDF',
    xlsx: 'Excel',
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select
        value={selectedFormat}
        onValueChange={(value) => setSelectedFormat(value as ExportFormat)}
        disabled={disabled || loading || isExporting}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="形式" />
        </SelectTrigger>
        <SelectContent>
          {formats.map((format) => (
            <SelectItem key={format} value={format}>
              {formatLabels[format]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={handleExport}
        disabled={disabled || loading || isExporting}
        variant="outline"
        size="sm"
      >
        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
        {isExporting ? 'エクスポート中...' : 'エクスポート'}
      </Button>
    </div>
  )
}
