import { Suspense } from "react"
import { Cog6ToothIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { ReservationSettings } from "@/components/reservations/ReservationSettings"
import { BusinessHoursEditor } from "@/components/reservations/BusinessHoursEditor"
import { ReminderSettings } from "@/components/reservations/ReminderSettings"
import { NotificationSettings } from "@/components/reservations/NotificationSettings"

export default function ReservationSettingsPage() {
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cog6ToothIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight">予約設定</h1>
          </div>
          <p className="text-muted-foreground">
            予約システムの各種設定を管理します
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">キャンセル</Button>
          <Button>設定を保存</Button>
        </div>
      </div>

      {/* 設定セクション */}
      <Suspense fallback={<div>Loading...</div>}>
        <div className="space-y-6">
          {/* 予約受付設定 */}
          <ReservationSettings />

          {/* 営業時間設定 */}
          <BusinessHoursEditor />

          {/* リマインダー設定 */}
          <ReminderSettings />

          {/* 通知設定 */}
          <NotificationSettings />
        </div>
      </Suspense>

      {/* フッターアクション */}
      <div className="flex items-center justify-end gap-2 pt-6 border-t">
        <Button variant="outline">キャンセル</Button>
        <Button>設定を保存</Button>
      </div>
    </div>
  )
}
