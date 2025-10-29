"use client"

import { useState } from "react"
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns"
import { ja } from "date-fns/locale"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from "@heroicons/react/24/outline"
import { MonthView } from "./MonthView"
import { WeekView } from "./WeekView"
import { DayView } from "./DayView"
import { ReservationDetailModal } from "./ReservationDetailModal"
import { ReservationSlotData } from "./ReservationSlot"

type ViewMode = "month" | "week" | "day"

interface CalendarViewProps {
  initialDate?: Date
  initialView?: ViewMode
}

export function CalendarView({ initialDate = new Date(), initialView = "month" }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [viewMode, setViewMode] = useState<ViewMode>(initialView)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedSlot, setSelectedSlot] = useState<ReservationSlotData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Mock reservations data
  const mockReservations: ReservationSlotData[] = [
    {
      id: "1",
      time: "10:00",
      customerName: "山田太郎",
      status: "booked",
      notes: "カット＆カラー希望"
    },
    {
      id: "2",
      time: "14:00",
      customerName: "佐藤花子",
      status: "pending",
      notes: "電話予約"
    },
    {
      id: "3",
      time: "16:00",
      status: "available"
    }
  ]

  const handlePrevious = () => {
    switch (viewMode) {
      case "month":
        setCurrentDate(prev => subMonths(prev, 1))
        break
      case "week":
        setCurrentDate(prev => subWeeks(prev, 1))
        break
      case "day":
        setCurrentDate(prev => subDays(prev, 1))
        break
    }
  }

  const handleNext = () => {
    switch (viewMode) {
      case "month":
        setCurrentDate(prev => addMonths(prev, 1))
        break
      case "week":
        setCurrentDate(prev => addWeeks(prev, 1))
        break
      case "day":
        setCurrentDate(prev => addDays(prev, 1))
        break
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
    if (viewMode === "month") {
      setCurrentDate(date)
      setViewMode("day")
    }
  }

  const handleSelectSlot = (slot: ReservationSlotData, date?: Date) => {
    setSelectedSlot(slot)
    if (date) {
      setSelectedDate(date)
    }
    setIsModalOpen(true)
  }

  const getDateRangeLabel = () => {
    switch (viewMode) {
      case "month":
        return format(currentDate, 'yyyy年M月', { locale: ja })
      case "week":
        const weekStart = new Date(currentDate)
        weekStart.setDate(currentDate.getDate() - currentDate.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        return `${format(weekStart, 'M月d日', { locale: ja })} - ${format(weekEnd, 'M月d日', { locale: ja })}`
      case "day":
        return format(currentDate, 'yyyy年M月d日 (E)', { locale: ja })
    }
  }

  return (
    <div className="space-y-4">
      {/* Calendar controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleToday}>
            <CalendarDaysIcon className="h-4 w-4 mr-2" />
            今日
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div className="min-w-[200px] text-center">
              <span className="text-lg font-semibold">{getDateRangeLabel()}</span>
            </div>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* View mode tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="month">月</TabsTrigger>
            <TabsTrigger value="week">週</TabsTrigger>
            <TabsTrigger value="day">日</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Calendar views */}
      <div>
        {viewMode === "month" && (
          <MonthView
            currentDate={currentDate}
            reservations={mockReservations}
            onSelectDate={handleSelectDate}
            selectedDate={selectedDate}
          />
        )}

        {viewMode === "week" && (
          <WeekView
            currentDate={currentDate}
            reservations={mockReservations}
            onSelectSlot={handleSelectSlot}
            selectedDate={selectedDate}
          />
        )}

        {viewMode === "day" && (
          <DayView
            currentDate={currentDate}
            reservations={mockReservations}
            onSelectSlot={(slot) => handleSelectSlot(slot, currentDate)}
          />
        )}
      </div>

      {/* Reservation detail modal */}
      <ReservationDetailModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        reservation={selectedSlot}
        date={selectedDate}
        onEdit={() => {
          console.log('Edit reservation:', selectedSlot)
          setIsModalOpen(false)
        }}
        onCancel={() => {
          console.log('Cancel reservation:', selectedSlot)
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}
