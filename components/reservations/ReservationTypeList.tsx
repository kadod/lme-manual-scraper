'use client'

import { useState } from 'react'
import { ReservationType } from '@/app/actions/reservation-types'
import { ReservationTypeCard } from './ReservationTypeCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Squares2X2Icon, ListBulletIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface ReservationTypeListProps {
  types: ReservationType[]
  onEdit: (type: ReservationType) => void
  onDelete: (type: ReservationType) => void
  onDuplicate: (type: ReservationType) => void
  onToggleStatus: (type: ReservationType) => void
}

type ViewMode = 'grid' | 'list'
type CategoryFilter = 'all' | 'event' | 'lesson' | 'salon'

export function ReservationTypeList({
  types,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
}: ReservationTypeListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')

  const filteredTypes = types.filter((type) => {
    const matchesSearch = type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all'
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="予約タイプを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="カテゴリ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="event">イベント予約</SelectItem>
              <SelectItem value="lesson">レッスン予約</SelectItem>
              <SelectItem value="salon">サロン予約</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Squares2X2Icon className="size-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <ListBulletIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {filteredTypes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || categoryFilter !== 'all'
              ? '条件に一致する予約タイプが見つかりません'
              : '予約タイプがまだありません'}
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {filteredTypes.map((type) => (
            <ReservationTypeCard
              key={type.id}
              type={type}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  )
}
