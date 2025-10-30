'use client'

import { useState } from 'react'
import { ArrowDownTrayIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportToCSV } from '@/lib/utils/chart-utils'

interface ChartExportButtonProps {
  data: Record<string, string | number | undefined>[]
  filename: string
  chartId?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function ChartExportButton({
  data,
  filename,
  chartId,
  variant = 'outline',
  size = 'sm',
}: ChartExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportCSV = () => {
    setIsExporting(true)
    try {
      exportToCSV(data, filename)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPNG = () => {
    if (!chartId) {
      console.error('Chart ID is required for PNG export')
      return
    }

    setIsExporting(true)
    try {
      // PNG export would require html2canvas or similar library
      console.log('PNG export for chart:', chartId)
      // exportToPNG(chartId, filename)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting}>
          <ArrowDownTrayIcon className="h-4 w-4" />
          エクスポート
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
          CSV形式で保存
        </DropdownMenuItem>
        {chartId && (
          <DropdownMenuItem onClick={handleExportPNG}>
            <PhotoIcon className="mr-2 h-4 w-4" />
            PNG形式で保存
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
