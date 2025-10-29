"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface ReservationSlotData {
  id: string
  time: string
  customerName?: string
  status: "available" | "booked" | "pending" | "cancelled"
  notes?: string
}

interface ReservationSlotProps {
  slot: ReservationSlotData
  onClick?: () => void
  compact?: boolean
}

export function ReservationSlot({ slot, onClick, compact = false }: ReservationSlotProps) {
  const statusConfig = {
    available: {
      label: "空き",
      variant: "outline" as const,
      bgColor: "bg-green-50 hover:bg-green-100 border-green-200",
      textColor: "text-green-700"
    },
    booked: {
      label: "予約済",
      variant: "default" as const,
      bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      textColor: "text-blue-900"
    },
    pending: {
      label: "保留中",
      variant: "secondary" as const,
      bgColor: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200",
      textColor: "text-yellow-900"
    },
    cancelled: {
      label: "キャンセル",
      variant: "destructive" as const,
      bgColor: "bg-gray-50 border-gray-200",
      textColor: "text-gray-500"
    }
  }

  const config = statusConfig[slot.status]

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-md border p-2 transition-colors",
        config.bgColor,
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        compact ? "text-xs" : "text-sm"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("font-medium", config.textColor)}>
          {slot.time}
        </span>
        <Badge variant={config.variant} className="text-xs">
          {config.label}
        </Badge>
      </div>
      {!compact && slot.customerName && (
        <div className="mt-1 text-xs text-gray-600 truncate">
          {slot.customerName}
        </div>
      )}
    </button>
  )
}
