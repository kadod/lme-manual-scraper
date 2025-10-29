'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { MessageFilters as Filters } from '@/app/actions/messages'

interface MessageFiltersProps {
  filters: Filters
  onFilterChange: (filters: Filters) => void
}

export function MessageFilters({ filters, onFilterChange }: MessageFiltersProps) {
  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value === 'all' ? undefined : value })
  }

  const handleTypeChange = (value: string) => {
    onFilterChange({ ...filters, type: value === 'all' ? undefined : value })
  }

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value || undefined })
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border rounded-lg">
      <div className="flex items-center gap-2">
        <FunnelIcon className="w-5 h-5 text-gray-500" />
        <h3 className="font-medium">フィルター</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="タイトルで検索"
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="draft">下書き</SelectItem>
            <SelectItem value="scheduled">予約中</SelectItem>
            <SelectItem value="sending">配信中</SelectItem>
            <SelectItem value="sent">完了</SelectItem>
            <SelectItem value="failed">失敗</SelectItem>
            <SelectItem value="cancelled">キャンセル</SelectItem>
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select value={filters.type || 'all'} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="メッセージタイプ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="text">テキスト</SelectItem>
            <SelectItem value="image">画像</SelectItem>
            <SelectItem value="video">動画</SelectItem>
            <SelectItem value="flex">Flexメッセージ</SelectItem>
            <SelectItem value="template">テンプレート</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        <Button
          variant="outline"
          onClick={() =>
            onFilterChange({
              status: undefined,
              type: undefined,
              search: undefined,
            })
          }
        >
          クリア
        </Button>
      </div>
    </div>
  )
}
