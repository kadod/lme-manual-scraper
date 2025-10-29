"use client"

import { format, isToday } from "date-fns"
import { ja } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { ReservationSlot, ReservationSlotData } from "./ReservationSlot"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DayViewProps {
  currentDate: Date
  reservations: ReservationSlotData[]
  onSelectSlot: (slot: ReservationSlotData) => void
}

export function DayView({ currentDate, reservations, onSelectSlot }: DayViewProps) {
  const isCurrentDay = isToday(currentDate)

  // Time slots from 9:00 to 18:00 (every 30 minutes)
  const timeSlots = Array.from({ length: 19 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9
    const minute = i % 2 === 0 ? '00' : '30'
    return `${hour.toString().padStart(2, '0')}:${minute}`
  })

  // Mock function to get reservations for a specific time
  const getReservationsForTime = (time: string): ReservationSlotData[] => {
    // In real implementation, filter reservations by time
    const random = Math.random()
    if (random < 0.3) {
      return [{
        id: `${format(currentDate, 'yyyy-MM-dd')}-${time}`,
        time,
        status: 'available'
      }]
    } else if (random < 0.5) {
      return [{
        id: `${format(currentDate, 'yyyy-MM-dd')}-${time}`,
        time,
        customerName: '山田太郎',
        status: 'booked',
        notes: 'カット＆カラー希望'
      }]
    } else if (random < 0.65) {
      return [{
        id: `${format(currentDate, 'yyyy-MM-dd')}-${time}`,
        time,
        customerName: '佐藤花子',
        status: 'pending',
        notes: '電話予約'
      }]
    }
    return []
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Date header */}
      <div className="border-b p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {format(currentDate, 'yyyy年M月d日 (E)', { locale: ja })}
            </h3>
            {isCurrentDay && (
              <p className="text-sm text-blue-600 mt-1">今日</p>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">空き: 5</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">予約: 8</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-gray-600">保留: 2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time slots */}
      <ScrollArea className="h-[600px]">
        <div className="p-4">
          <div className="space-y-2">
            {timeSlots.map((time) => {
              const slots = getReservationsForTime(time)
              const isHourMark = time.endsWith(':00')

              return (
                <div
                  key={time}
                  className={cn(
                    "grid grid-cols-[100px_1fr] gap-4 items-start",
                    isHourMark && "pt-2"
                  )}
                >
                  {/* Time label */}
                  <div className={cn(
                    "text-right pt-2",
                    isHourMark ? "font-semibold text-gray-900" : "text-gray-500 text-sm"
                  )}>
                    {time}
                  </div>

                  {/* Slot content */}
                  <div className={cn(
                    "min-h-[60px]",
                    isHourMark && "border-t pt-2"
                  )}>
                    {slots.length > 0 ? (
                      <div className="space-y-2">
                        {slots.map((slot) => (
                          <ReservationSlot
                            key={slot.id}
                            slot={slot}
                            onClick={() => onSelectSlot(slot)}
                          />
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelectSlot({
                          id: `new-${time}`,
                          time,
                          status: 'available'
                        })}
                        className="w-full h-full min-h-[60px] border-2 border-dashed border-gray-200 rounded-md hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm text-gray-400 hover:text-blue-600"
                      >
                        予約を追加
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
