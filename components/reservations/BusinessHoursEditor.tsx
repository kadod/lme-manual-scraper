"use client"

import { useState } from "react"
import { ClockIcon } from "@heroicons/react/24/outline"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface BusinessHours {
  day: string
  enabled: boolean
  openTime: string
  closeTime: string
}

const DAYS = ["月", "火", "水", "木", "金", "土", "日"]

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0")
  return [
    { value: `${hour}:00`, label: `${hour}:00` },
    { value: `${hour}:30`, label: `${hour}:30` }
  ]
}).flat()

export function BusinessHoursEditor() {
  const [hours, setHours] = useState<BusinessHours[]>(
    DAYS.map(day => ({
      day,
      enabled: day !== "日",
      openTime: "09:00",
      closeTime: "18:00"
    }))
  )

  const updateDay = (index: number, field: keyof BusinessHours, value: boolean | string) => {
    const newHours = [...hours]
    newHours[index] = { ...newHours[index], [field]: value }
    setHours(newHours)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle>営業時間設定</CardTitle>
        </div>
        <CardDescription>
          曜日ごとの営業時間を設定してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hours.map((hour, index) => (
            <div
              key={hour.day}
              className="flex items-center gap-4 p-4 rounded-lg border"
            >
              <div className="w-12 font-medium">{hour.day}曜日</div>

              <Switch
                checked={hour.enabled}
                onCheckedChange={(checked) => updateDay(index, "enabled", checked)}
              />

              <div className="flex items-center gap-2 flex-1">
                <Select
                  value={hour.openTime}
                  onValueChange={(value) => updateDay(index, "openTime", value)}
                  disabled={!hour.enabled}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="text-muted-foreground">〜</span>

                <Select
                  value={hour.closeTime}
                  onValueChange={(value) => updateDay(index, "closeTime", value)}
                  disabled={!hour.enabled}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!hour.enabled && (
                <span className="text-sm text-muted-foreground">定休日</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
