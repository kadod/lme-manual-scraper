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
import { CalendarIcon } from '@heroicons/react/24/outline'

export type DateRangePreset = 'today' | '7d' | '30d' | '90d' | 'week' | 'month' | 'custom'
export type ComparisonPeriod = 'previous-week' | 'previous-month' | 'none'

interface DateRangePickerProps {
  selectedRange: DateRangePreset
  comparisonPeriod: ComparisonPeriod
  onRangeChange: (range: DateRangePreset) => void
  onComparisonChange: (period: ComparisonPeriod) => void
}

export function DateRangePicker({
  selectedRange,
  comparisonPeriod,
  onRangeChange,
  onComparisonChange,
}: DateRangePickerProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-gray-500" />
        <Select value={selectedRange} onValueChange={(value) => onRangeChange(value as DateRangePreset)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="期間を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">今日</SelectItem>
            <SelectItem value="7d">過去7日間</SelectItem>
            <SelectItem value="30d">過去30日間</SelectItem>
            <SelectItem value="90d">過去90日間</SelectItem>
            <SelectItem value="week">今週</SelectItem>
            <SelectItem value="month">今月</SelectItem>
            <SelectItem value="custom">カスタム期間</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">比較:</span>
        <Select value={comparisonPeriod} onValueChange={(value) => onComparisonChange(value as ComparisonPeriod)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="比較期間" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">なし</SelectItem>
            <SelectItem value="previous-week">前週比</SelectItem>
            <SelectItem value="previous-month">前月比</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
