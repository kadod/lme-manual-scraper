"use client"

import { useState } from "react"
import { BellIcon } from "@heroicons/react/24/outline"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ReminderSettings() {
  const [reminder24h, setReminder24h] = useState(true)
  const [reminder1h, setReminder1h] = useState(true)
  const [customReminderEnabled, setCustomReminderEnabled] = useState(false)
  const [customHours, setCustomHours] = useState("2")
  const [customUnit, setCustomUnit] = useState<"hours" | "days">("hours")

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BellIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle>リマインダー設定</CardTitle>
        </div>
        <CardDescription>
          予約前のリマインダー通知を設定してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 24時間前リマインダー */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-1">
              <Label className="text-base font-medium">24時間前リマインダー</Label>
              <p className="text-sm text-muted-foreground">
                予約の24時間前に通知を送信します
              </p>
            </div>
            <Switch
              checked={reminder24h}
              onCheckedChange={setReminder24h}
            />
          </div>

          {/* 1時間前リマインダー */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-1">
              <Label className="text-base font-medium">1時間前リマインダー</Label>
              <p className="text-sm text-muted-foreground">
                予約の1時間前に通知を送信します
              </p>
            </div>
            <Switch
              checked={reminder1h}
              onCheckedChange={setReminder1h}
            />
          </div>

          {/* カスタムリマインダー */}
          <div className="p-4 rounded-lg border space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">カスタムリマインダー</Label>
                <p className="text-sm text-muted-foreground">
                  独自のタイミングでリマインダーを設定できます
                </p>
              </div>
              <Switch
                checked={customReminderEnabled}
                onCheckedChange={setCustomReminderEnabled}
              />
            </div>

            {customReminderEnabled && (
              <div className="flex items-center gap-2 pt-2">
                <Label>予約の</Label>
                <Input
                  type="number"
                  min="1"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  className="w-20"
                />
                <Select
                  value={customUnit}
                  onValueChange={(value: "hours" | "days") => setCustomUnit(value)}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">時間前</SelectItem>
                    <SelectItem value="days">日前</SelectItem>
                  </SelectContent>
                </Select>
                <Label>に通知</Label>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
