'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import type { ReservationFilters as Filters } from '@/app/actions/reservations'

interface ReservationFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  reservationTypes?: Array<{ id: string; name: string }>
}

export function ReservationFilters({
  filters,
  onFiltersChange,
  reservationTypes = [],
}: ReservationFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value })
  }

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      reservationTypeId: value === 'all' ? undefined : value,
    })
  }

  const handleReset = () => {
    onFiltersChange({
      status: 'all',
      search: '',
    })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer name, email, or phone..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
          <SelectItem value="no_show">No Show</SelectItem>
        </SelectContent>
      </Select>

      {reservationTypes.length > 0 && (
        <Select
          value={filters.reservationTypeId || 'all'}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {reservationTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={handleReset}
        title="Reset filters"
      >
        <FunnelIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
