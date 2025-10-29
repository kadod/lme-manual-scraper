'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'

export interface FilterOption {
  id: string
  label: string
  type: 'select' | 'multiselect' | 'date' | 'text'
  options?: { value: string; label: string }[]
  value?: string | string[]
}

interface FilterPanelProps {
  filters: FilterOption[]
  onFilterChange: (filterId: string, value: string | string[]) => void
  onReset?: () => void
  showResetButton?: boolean
  className?: string
}

export function FilterPanel({
  filters,
  onFilterChange,
  onReset,
  showResetButton = true,
  className,
}: FilterPanelProps) {
  const [collapsed, setCollapsed] = useState(false)

  const handleReset = () => {
    filters.forEach(filter => {
      if (filter.type === 'multiselect') {
        onFilterChange(filter.id, [])
      } else {
        onFilterChange(filter.id, '')
      }
    })
    onReset?.()
  }

  const hasActiveFilters = filters.some(filter => {
    if (Array.isArray(filter.value)) {
      return filter.value.length > 0
    }
    return filter.value !== '' && filter.value !== undefined
  })

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <CardTitle className="text-base font-semibold">フィルター</CardTitle>
          {hasActiveFilters && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              適用中
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showResetButton && hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 px-2"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              リセット
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 px-2"
          >
            {collapsed ? '展開' : '折りたたむ'}
          </Button>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.id} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {filter.label}
                </label>
                {filter.type === 'select' && filter.options && (
                  <Select
                    value={filter.value as string}
                    onValueChange={(value) => onFilterChange(filter.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`${filter.label}を選択`} />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {filter.type === 'text' && (
                  <input
                    type="text"
                    value={filter.value as string}
                    onChange={(e) => onFilterChange(filter.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`${filter.label}を入力`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
