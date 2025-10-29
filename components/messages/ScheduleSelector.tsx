'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface ScheduleSelectorProps {
  scheduledAt: string | null
  onChange: (value: string | null) => void
}

export function ScheduleSelector({ scheduledAt, onChange }: ScheduleSelectorProps) {
  const [scheduleType, setScheduleType] = useState<'now' | 'scheduled'>(
    scheduledAt ? 'scheduled' : 'now'
  )
  const [date, setDate] = useState<Date | undefined>(
    scheduledAt ? new Date(scheduledAt) : undefined
  )
  const [time, setTime] = useState<string>(
    scheduledAt ? format(new Date(scheduledAt), 'HH:mm') : '09:00'
  )

  const handleScheduleTypeChange = (value: 'now' | 'scheduled') => {
    setScheduleType(value)
    if (value === 'now') {
      onChange(null)
    } else if (date) {
      const [hours, minutes] = time.split(':')
      const scheduledDate = new Date(date)
      scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      onChange(scheduledDate.toISOString())
    }
  }

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate && scheduleType === 'scheduled') {
      const [hours, minutes] = time.split(':')
      const scheduledDate = new Date(newDate)
      scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      onChange(scheduledDate.toISOString())
    }
  }

  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    if (date && scheduleType === 'scheduled') {
      const [hours, minutes] = newTime.split(':')
      const scheduledDate = new Date(date)
      scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      onChange(scheduledDate.toISOString())
    }
  }

  return (
    <div className="space-y-4">
      <Label>配信タイミング</Label>
      <RadioGroup value={scheduleType} onValueChange={handleScheduleTypeChange}>
        <div className="space-y-3">
          <Label
            htmlFor="now"
            className={`
              flex items-center gap-3 rounded-lg border-2 p-4 cursor-pointer
              transition-all hover:border-primary/50
              ${scheduleType === 'now' ? 'border-primary bg-primary/5' : 'border-muted'}
            `}
          >
            <RadioGroupItem id="now" value="now" />
            <div className="flex-1">
              <div className="font-medium">即時配信</div>
              <div className="text-sm text-muted-foreground">
                確認後すぐにメッセージを配信します
              </div>
            </div>
          </Label>

          <Label
            htmlFor="scheduled"
            className={`
              flex items-center gap-3 rounded-lg border-2 p-4 cursor-pointer
              transition-all hover:border-primary/50
              ${scheduleType === 'scheduled' ? 'border-primary bg-primary/5' : 'border-muted'}
            `}
          >
            <RadioGroupItem id="scheduled" value="scheduled" />
            <div className="flex-1">
              <div className="font-medium">予約配信</div>
              <div className="text-sm text-muted-foreground">
                指定した日時にメッセージを配信します
              </div>
            </div>
          </Label>
        </div>
      </RadioGroup>

      {scheduleType === 'scheduled' && (
        <div className="space-y-4 pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>配信日</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, 'PPP', { locale: ja })
                    ) : (
                      <span>日付を選択</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">配信時刻</Label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {date && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <div className="font-medium mb-1">配信予定日時</div>
              <div className="text-muted-foreground">
                {format(
                  new Date(`${format(date, 'yyyy-MM-dd')}T${time}`),
                  'yyyy年MM月dd日 HH:mm',
                  { locale: ja }
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
