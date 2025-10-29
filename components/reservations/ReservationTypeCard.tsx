'use client'

import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, UserGroupIcon, ClockIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ReservationType } from '@/app/actions/reservation-types'

interface ReservationTypeCardProps {
  type: ReservationType
  onEdit: (type: ReservationType) => void
  onDelete: (type: ReservationType) => void
  onDuplicate: (type: ReservationType) => void
  onToggleStatus: (type: ReservationType) => void
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'event':
      return CalendarIcon
    case 'lesson':
      return ClockIcon
    case 'salon':
      return UserGroupIcon
    default:
      return CalendarIcon
  }
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'event':
      return 'イベント予約'
    case 'lesson':
      return 'レッスン予約'
    case 'salon':
      return 'サロン予約'
    default:
      return category
  }
}

export function ReservationTypeCard({
  type,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
}: ReservationTypeCardProps) {
  const Icon = getCategoryIcon(type.settings?.category || 'event')

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div
            className="p-2 rounded-lg shrink-0"
            style={{ backgroundColor: `${type.settings?.color || '#3B82F6'}20` }}
          >
            <Icon
              className="size-5"
              style={{ color: type.settings?.color || '#3B82F6' }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{type.name}</CardTitle>
            {type.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {type.description}
              </p>
            )}
          </div>
        </div>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <EllipsisVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(type)}>
                編集
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(type)}>
                複製
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(type)}>
                {type.status === 'active' ? '無効化' : '有効化'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(type)}
                className="text-destructive"
              >
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">
            {getCategoryLabel(type.settings?.category || 'event')}
          </Badge>
          <Badge variant={type.status === 'active' ? 'default' : 'secondary'}>
            {type.status === 'active' ? '有効' : '無効'}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">時間:</span>
            <span className="ml-1 font-medium">{type.duration_minutes}分</span>
          </div>
          {type.buffer_minutes > 0 && (
            <div>
              <span className="text-muted-foreground">準備:</span>
              <span className="ml-1 font-medium">{type.buffer_minutes}分</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
