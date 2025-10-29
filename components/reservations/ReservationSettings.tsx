"use client"

import { useState } from "react"
import { Cog6ToothIcon, CalendarDaysIcon } from "@heroicons/react/24/outline"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ReservationSettings() {
  const [acceptanceStartDays, setAcceptanceStartDays] = useState("30")
  const [acceptanceEndHours, setAcceptanceEndHours] = useState("2")
  const [maxSimultaneousReservations, setMaxSimultaneousReservations] = useState("1")

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cog6ToothIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle>予約受付設定</CardTitle>
        </div>
        <CardDescription>
          予約の受付期間と同時予約数を設定してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 受付開始日時 */}
          <div className="space-y-3 p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5 text-muted-foreground" />
              <Label className="text-base font-medium">受付開始日時</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">予約可能期間：</Label>
              <Input
                type="number"
                min="1"
                max="365"
                value={acceptanceStartDays}
                onChange={(e) => setAcceptanceStartDays(e.target.value)}
                className="w-20"
              />
              <Label className="text-sm">日前から受付可能</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              例：30日前の場合、30日後までの予約を受け付けます
            </p>
          </div>

          {/* 受付終了時刻 */}
          <div className="space-y-3 p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5 text-muted-foreground" />
              <Label className="text-base font-medium">受付終了時刻</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">当日予約：</Label>
              <Input
                type="number"
                min="0"
                max="24"
                value={acceptanceEndHours}
                onChange={(e) => setAcceptanceEndHours(e.target.value)}
                className="w-20"
              />
              <Label className="text-sm">時間前まで受付可能</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              例：2時間前の場合、予約時刻の2時間前まで受け付けます
            </p>
          </div>

          {/* 同時予約可能数 */}
          <div className="space-y-3 p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5 text-muted-foreground" />
              <Label className="text-base font-medium">同時予約可能数</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">同時に</Label>
              <Select
                value={maxSimultaneousReservations}
                onValueChange={setMaxSimultaneousReservations}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label className="text-sm">件まで予約可能</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              同じ時間帯に受け付ける予約の最大数を設定します
            </p>
          </div>

          {/* 予約間隔設定 */}
          <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
            <Label className="text-base font-medium">予約時間の間隔</Label>
            <Select defaultValue="30">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15分</SelectItem>
                <SelectItem value="30">30分</SelectItem>
                <SelectItem value="60">60分</SelectItem>
                <SelectItem value="90">90分</SelectItem>
                <SelectItem value="120">120分</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              予約の時間単位を設定します
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
