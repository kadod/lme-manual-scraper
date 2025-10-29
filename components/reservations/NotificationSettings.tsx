"use client"

import { useState } from "react"
import { EnvelopeIcon, BellAlertIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function NotificationSettings() {
  const [emailConfirmation, setEmailConfirmation] = useState(true)
  const [emailReminder, setEmailReminder] = useState(true)
  const [emailCancellation, setEmailCancellation] = useState(true)
  const [adminNewReservation, setAdminNewReservation] = useState(true)
  const [lineNotification, setLineNotification] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BellAlertIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle>通知設定</CardTitle>
        </div>
        <CardDescription>
          メール通知とLINE通知の設定を管理します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email" className="w-full">
          <TabsList>
            <TabsTrigger value="email">
              <EnvelopeIcon className="h-4 w-4" />
              メール通知
            </TabsTrigger>
            <TabsTrigger value="line">
              <ChatBubbleLeftIcon className="h-4 w-4" />
              LINE通知
            </TabsTrigger>
            <TabsTrigger value="admin">
              <BellAlertIcon className="h-4 w-4" />
              管理者通知
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 mt-4">
            {/* 予約完了メール */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-1">
                <Label className="text-base font-medium">予約完了メール</Label>
                <p className="text-sm text-muted-foreground">
                  予約完了時に確認メールを送信します
                </p>
              </div>
              <Switch
                checked={emailConfirmation}
                onCheckedChange={setEmailConfirmation}
              />
            </div>

            {/* リマインダーメール */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-1">
                <Label className="text-base font-medium">リマインダーメール</Label>
                <p className="text-sm text-muted-foreground">
                  予約前のリマインダーをメールで送信します
                </p>
              </div>
              <Switch
                checked={emailReminder}
                onCheckedChange={setEmailReminder}
              />
            </div>

            {/* キャンセル通知メール */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-1">
                <Label className="text-base font-medium">キャンセル通知メール</Label>
                <p className="text-sm text-muted-foreground">
                  予約キャンセル時に通知メールを送信します
                </p>
              </div>
              <Switch
                checked={emailCancellation}
                onCheckedChange={setEmailCancellation}
              />
            </div>
          </TabsContent>

          <TabsContent value="line" className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-1">
                <Label className="text-base font-medium">LINE通知</Label>
                <p className="text-sm text-muted-foreground">
                  予約関連の通知をLINEで送信します
                </p>
              </div>
              <Switch
                checked={lineNotification}
                onCheckedChange={setLineNotification}
              />
            </div>

            {lineNotification && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm font-medium">LINE通知の設定手順</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>LINE公式アカウントでMessaging APIを有効化</li>
                  <li>チャネルアクセストークンを取得</li>
                  <li>Webhook URLを設定</li>
                  <li>ユーザーIDを連携</li>
                </ol>
              </div>
            )}
          </TabsContent>

          <TabsContent value="admin" className="space-y-4 mt-4">
            {/* 管理者通知 */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-1">
                <Label className="text-base font-medium">新規予約通知</Label>
                <p className="text-sm text-muted-foreground">
                  新しい予約が入ったときに管理者に通知します
                </p>
              </div>
              <Switch
                checked={adminNewReservation}
                onCheckedChange={setAdminNewReservation}
              />
            </div>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                管理者通知は登録されているメールアドレスとLINEアカウントに送信されます
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
