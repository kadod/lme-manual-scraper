"use client"

import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { ReservationSlot, ReservationSlotData } from "./ReservationSlot"
import { ScrollArea } from "@/components/ui/scroll-area"

interface WeekViewProps {
  currentDate: Date
  reservations: ReservationSlotData[]
  onSelectSlot: (slot: ReservationSlotData, date: Date) => void
  selectedDate?: Date
}

export function WeekView({ currentDate, reservations, onSelectSlot, selectedDate }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Time slots from 9:00 to 18:00
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 9 + i
    return `${hour.toString().padStart(2, '0')}:00`
  })

  // Mock function to get reservations for a specific day and time
  const getReservationsForSlot = (date: Date, time: string): ReservationSlotData[] => {
    // In real implementation, filter reservations by date and time
    const random = Math.random()
    if (random < 0.3) {
      return [{
        id: `${format(date, 'yyyy-MM-dd')}-${time}`,
        time,
        status: 'available'
      }]
    } else if (random < 0.6) {
      return [{
        id: `${format(date, 'yyyy-MM-dd')}-${time}`,
        time,
        customerName: '山田太郎',
        status: 'booked'
      }]
    } else if (random < 0.8) {
      return [{
        id: `${format(date, 'yyyy-MM-dd')}-${time}`,
        time,
        customerName: '佐藤花子',
        status: 'pending'
      }]
    }
    return []
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-8">
          {/* Time column header */}
          <div className="sticky top-0 bg-gray-50 border-b border-r p-2 z-10">
            <span className="text-xs font-medium text-gray-500">時間</span>
          </div>

          {/* Day headers */}
          {daysInWeek.map((day) => {
            const isCurrentDay = isToday(day)
            const isSelected = selectedDate && isSameDay(day, selectedDate)

            return (
              <div
                key={format(day, 'yyyy-MM-dd')}
                className={cn(
                  "sticky top-0 bg-gray-50 border-b border-r p-2 text-center z-10",
                  isSelected && "bg-blue-50"
                )}
              >
                <div className="text-xs text-gray-500">
                  {format(day, 'M/d (E)', { locale: ja })}
                </div>
                {isCurrentDay && (
                  <div className="mt-1">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-medium">
                      {format(day, 'd')}
                    </span>
                  </div>
                )}
              </div>
            )
          })}

          {/* Time slots */}
          {timeSlots.map((time) => (
            <>
              {/* Time label */}
              <div
                key={`time-${time}`}
                className="border-b border-r p-2 text-xs text-gray-500 font-medium bg-gray-50"
              >
                {time}
              </div>

              {/* Slots for each day */}
              {daysInWeek.map((day) => {
                const slots = getReservationsForSlot(day, time)
                const isSelected = selectedDate && isSameDay(day, selectedDate)

                return (
                  <div
                    key={`${format(day, 'yyyy-MM-dd')}-${time}`}
                    className={cn(
                      "border-b border-r p-1",
                      isSelected && "bg-blue-50/30"
                    )}
                  >
                    {slots.length > 0 ? (
                      <div className="space-y-1">
                        {slots.map((slot) => (
                          <ReservationSlot
                            key={slot.id}
                            slot={slot}
                            onClick={() => onSelectSlot(slot, day)}
                            compact
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="h-12" />
                    )}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
