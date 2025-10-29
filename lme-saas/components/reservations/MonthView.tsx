"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { ReservationSlotData } from "./ReservationSlot"
import { Badge } from "@/components/ui/badge"

interface MonthViewProps {
  currentDate: Date
  reservations: ReservationSlotData[]
  onSelectDate: (date: Date) => void
  selectedDate?: Date
}

export function MonthView({ currentDate, reservations, onSelectDate, selectedDate }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)

  // Get all days in the month
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Calculate starting day offset (0 = Sunday)
  const startDayOffset = monthStart.getDay()

  // Fill in days from previous month
  const days = Array(startDayOffset).fill(null).concat(daysInMonth)

  // Calculate total cells needed (7 columns)
  const totalCells = Math.ceil(days.length / 7) * 7
  const remainingCells = totalCells - days.length
  days.push(...Array(remainingCells).fill(null))

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  // Count reservations by date
  const getReservationCount = (date: Date | null) => {
    if (!date) return { total: 0, booked: 0 }
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayReservations = reservations.filter(r => {
      // Mock: In real implementation, filter by actual date
      return true
    })
    const booked = dayReservations.filter(r => r.status === 'booked').length
    return { total: dayReservations.length, booked }
  }

  return (
    <div className="bg-white rounded-lg border">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={cn(
              "p-2 text-center text-sm font-medium",
              index === 0 ? "text-red-600" : index === 6 ? "text-blue-600" : "text-gray-700"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="min-h-[100px] border-b border-r p-2 bg-gray-50" />
          }

          const isCurrentMonth = isSameMonth(day, currentDate)
          const isCurrentDay = isToday(day)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const { total, booked } = getReservationCount(day)

          return (
            <button
              key={format(day, 'yyyy-MM-dd')}
              onClick={() => onSelectDate(day)}
              className={cn(
                "min-h-[100px] border-b border-r p-2 text-left transition-colors",
                "hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !isCurrentMonth && "bg-gray-50/50 text-gray-400",
                isSelected && "bg-blue-50 border-blue-300"
              )}
            >
              <div className="flex flex-col h-full">
                <div className={cn(
                  "text-sm font-medium mb-2",
                  isCurrentDay && "flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white"
                )}>
                  {format(day, 'd')}
                </div>

                {isCurrentMonth && total > 0 && (
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {booked}/{total}
                      </Badge>
                    </div>
                    {booked > 0 && (
                      <div className="flex gap-1">
                        {[...Array(Math.min(3, booked))].map((_, i) => (
                          <div key={i} className="w-1 h-1 rounded-full bg-blue-600" />
                        ))}
                        {booked > 3 && (
                          <span className="text-xs text-gray-500">+{booked - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
