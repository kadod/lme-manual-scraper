'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import type { ReportSchedule, ReportFrequency } from '@/types/custom-reports'
import {
  validateCronExpression,
  cronToHumanReadable,
  CRON_PRESETS,
  TIMEZONES,
} from '@/lib/cron-utils'

interface ScheduleEditorProps {
  schedule: ReportSchedule | null
  onChange: (schedule: ReportSchedule | null) => void
  disabled?: boolean
}

export function ScheduleEditor({ schedule, onChange, disabled }: ScheduleEditorProps) {
  const [enabled, setEnabled] = useState(schedule !== null)
  const [cronError, setCronError] = useState<string | null>(null)

  const handleEnableToggle = (checked: boolean) => {
    setEnabled(checked)
    if (!checked) {
      onChange(null)
    } else {
      onChange({
        frequency: 'manual',
        time: '09:00',
        timezone: 'Asia/Tokyo',
        emailRecipients: [],
      })
    }
  }

  const handleFrequencyChange = (frequency: ReportFrequency) => {
    if (!schedule) return

    const updates: Partial<ReportSchedule> = { frequency }

    if (frequency === 'weekly') {
      updates.dayOfWeek = 1
      delete updates.dayOfMonth
      delete updates.cronExpression
    } else if (frequency === 'monthly') {
      updates.dayOfMonth = 1
      delete updates.dayOfWeek
      delete updates.cronExpression
    } else if (frequency === 'custom') {
      updates.cronExpression = '0 9 * * *'
      delete updates.dayOfWeek
      delete updates.dayOfMonth
    } else {
      delete updates.dayOfWeek
      delete updates.dayOfMonth
      delete updates.cronExpression
    }

    onChange({ ...schedule, ...updates } as ReportSchedule)
  }

  const handleCronExpressionChange = (value: string) => {
    if (!schedule) return
    onChange({ ...schedule, cronExpression: value })

    const validation = validateCronExpression(value)
    if (validation.valid) {
      setCronError(null)
    } else {
      setCronError(validation.error || null)
    }
  }

  const handleCronPresetSelect = (value: string) => {
    if (!schedule) return
    onChange({ ...schedule, cronExpression: value })
    setCronError(null)
  }

  const handleTimezoneChange = (timezone: string) => {
    if (!schedule) return
    onChange({ ...schedule, timezone })
  }

  const handleDayChange = (value: string) => {
    if (!schedule) return

    if (schedule.frequency === 'weekly') {
      onChange({ ...schedule, dayOfWeek: parseInt(value) })
    } else if (schedule.frequency === 'monthly') {
      onChange({ ...schedule, dayOfMonth: parseInt(value) })
    }
  }

  const handleTimeChange = (time: string) => {
    if (!schedule) return
    onChange({ ...schedule, time })
  }

  const handleAddEmail = (email: string) => {
    if (!schedule || !email.trim()) return

    if (!schedule.emailRecipients.includes(email)) {
      onChange({
        ...schedule,
        emailRecipients: [...schedule.emailRecipients, email],
      })
    }
  }

  const handleRemoveEmail = (email: string) => {
    if (!schedule) return

    onChange({
      ...schedule,
      emailRecipients: schedule.emailRecipients.filter((e) => e !== email),
    })
  }

  const weekDays = [
    { value: '0', label: '日曜日' },
    { value: '1', label: '月曜日' },
    { value: '2', label: '火曜日' },
    { value: '3', label: '水曜日' },
    { value: '4', label: '木曜日' },
    { value: '5', label: '金曜日' },
    { value: '6', label: '土曜日' },
  ]

  const monthDays = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}日`,
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>スケジュール設定</CardTitle>
            <CardDescription>
              レポートを自動生成してメール送信する設定
            </CardDescription>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={handleEnableToggle}
            disabled={disabled}
          />
        </div>
      </CardHeader>
      {enabled && schedule && (
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="frequency">実行頻度</Label>
            <Select
              value={schedule.frequency}
              onValueChange={handleFrequencyChange}
              disabled={disabled}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">手動のみ</SelectItem>
                <SelectItem value="daily">毎日</SelectItem>
                <SelectItem value="weekly">毎週</SelectItem>
                <SelectItem value="monthly">毎月</SelectItem>
                <SelectItem value="custom">カスタム (Cron式)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {schedule.frequency === 'weekly' && (
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">曜日</Label>
              <Select
                value={String(schedule.dayOfWeek)}
                onValueChange={handleDayChange}
                disabled={disabled}
              >
                <SelectTrigger id="dayOfWeek">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {schedule.frequency === 'monthly' && (
            <div className="space-y-2">
              <Label htmlFor="dayOfMonth">日付</Label>
              <Select
                value={String(schedule.dayOfMonth)}
                onValueChange={handleDayChange}
                disabled={disabled}
              >
                <SelectTrigger id="dayOfMonth">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthDays.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {schedule.frequency === 'custom' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cronPreset">プリセット</Label>
                <Select
                  onValueChange={handleCronPresetSelect}
                  disabled={disabled}
                >
                  <SelectTrigger id="cronPreset">
                    <SelectValue placeholder="プリセットを選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CRON_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label} - {preset.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cronExpression">Cron式</Label>
                <Input
                  id="cronExpression"
                  value={schedule.cronExpression || ''}
                  onChange={(e) => handleCronExpressionChange(e.target.value)}
                  placeholder="0 9 * * *"
                  disabled={disabled}
                  className={cronError ? 'border-destructive' : ''}
                />
                {cronError && (
                  <p className="text-sm text-destructive">{cronError}</p>
                )}
                {!cronError && schedule.cronExpression && (
                  <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                    <InformationCircleIcon className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">実行タイミング:</p>
                      <p className="text-muted-foreground">
                        {cronToHumanReadable(schedule.cronExpression)}
                      </p>
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  形式: 分 時 日 月 曜日 (例: 0 9 * * 1 = 毎週月曜日9時)
                </p>
              </div>
            </div>
          )}

          {schedule.frequency !== 'manual' && schedule.frequency !== 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="time">時刻</Label>
              <Input
                id="time"
                type="time"
                value={schedule.time}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={disabled}
              />
            </div>
          )}

          {schedule.frequency !== 'manual' && (
            <div className="space-y-2">
              <Label htmlFor="timezone">タイムゾーン</Label>
              <Select
                value={schedule.timezone || 'Asia/Tokyo'}
                onValueChange={handleTimezoneChange}
                disabled={disabled}
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">メール送信先</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="example@company.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddEmail(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
                disabled={disabled}
              />
              <Button
                type="button"
                onClick={(e) => {
                  const input = e.currentTarget.parentElement?.querySelector('input')
                  if (input) {
                    handleAddEmail(input.value)
                    input.value = ''
                  }
                }}
                disabled={disabled}
              >
                追加
              </Button>
            </div>
            {schedule.emailRecipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {schedule.emailRecipients.map((email) => (
                  <Badge key={email} variant="secondary" className="gap-1">
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      disabled={disabled}
                      className="ml-1 hover:text-destructive"
                    >
                      <XMarkIcon className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
