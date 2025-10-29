'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import { getAvailableSlotsByDate, SlotWithAvailability } from '@/app/actions/public-reservations'

interface SlotSelectorProps {
  reservationTypeId: string
  onSlotSelect: (slot: SlotWithAvailability) => void
  selectedSlot?: SlotWithAvailability | null
}

export function SlotSelector({ reservationTypeId, onSlotSelect, selectedSlot }: SlotSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [availableSlots, setAvailableSlots] = useState<SlotWithAvailability[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedDate) {
      loadSlots(selectedDate)
    }
  }, [selectedDate])

  const loadSlots = async (date: Date) => {
    setLoading(true)
    setError(null)
    try {
      const slots = await getAvailableSlotsByDate(reservationTypeId, date)
      setAvailableSlots(slots)

      if (slots.length === 0) {
        setError('この日は空き枠がありません')
      }
    } catch (err) {
      setError('空き枠の取得中にエラーが発生しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: ja })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            日付を選択
          </CardTitle>
          <CardDescription>
            ご希望の日付を選択してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0))}
            locale={ja}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              時間を選択
            </CardTitle>
            <CardDescription>
              {format(selectedDate, 'yyyy年M月d日(E)', { locale: ja })}の空き枠
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">読み込み中...</div>
              </div>
            ) : error ? (
              <Alert>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : availableSlots.length === 0 ? (
              <Alert>
                <AlertDescription>この日は予約できる時間枠がありません</AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                    disabled={!slot.is_available}
                    onClick={() => onSlotSelect(slot)}
                    className="flex flex-col h-auto py-3"
                  >
                    <span className="text-sm font-medium">
                      {formatTime(slot.start_time)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {slot.is_available ? `残り${slot.remaining_capacity}枠` : '満席'}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedSlot && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">選択中の時間枠</p>
                <p className="text-lg font-semibold">
                  {selectedDate && format(selectedDate, 'yyyy年M月d日(E)', { locale: ja })}
                </p>
                <p className="text-lg font-semibold">
                  {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onSlotSelect(selectedSlot)}>
                変更
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
