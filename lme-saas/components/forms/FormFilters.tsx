'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'

type FormFiltersProps = {
  statusFilter: string
  searchQuery: string
  viewMode: 'grid' | 'list'
  onStatusChange: (status: string) => void
  onSearchChange: (query: string) => void
  onViewModeChange: (mode: 'grid' | 'list') => void
}

export function FormFilters({
  statusFilter,
  searchQuery,
  viewMode,
  onStatusChange,
  onSearchChange,
  onViewModeChange,
}: FormFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="フォームを検索..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="ステータス" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">すべて</SelectItem>
          <SelectItem value="draft">下書き</SelectItem>
          <SelectItem value="published">公開中</SelectItem>
          <SelectItem value="closed">終了</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex gap-1 border rounded-md p-1">
        <Button
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => onViewModeChange('grid')}
        >
          <Squares2X2Icon className="h-5 w-5" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => onViewModeChange('list')}
        >
          <ListBulletIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
