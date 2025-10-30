'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CheckCircleIcon,
  XCircleIcon,
  LinkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  CalendarIcon,
  BellIcon,
  TrashIcon,
  PlusIcon,
  Bars3Icon,
  PhotoIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

type MenuItem =
  | 'messages'
  | 'booking-cancel'
  | 'reminders'
  | 'availability-notification'
  | 'booking-screen'
  | 'customer-questions'
  | 'page-display'
  | 'top-screen'
  | 'business-info'
  | 'terms'
  | 'integrations'
  | 'google-sheets'
  | 'other'
  | 'delete-system'

interface ReservationOverallSettingsProps {
  reservationId?: string
  reservationName?: string
}

export function ReservationOverallSettings({
  reservationId,
  reservationName = '無料相談',
}: ReservationOverallSettingsProps) {
  const [activeMenu, setActiveMenu] = useState<MenuItem>('booking-cancel')
  const [bookingTab, setBookingTab] = useState<'message' | 'action' | 'settings'>('message')
  const [cancelTab, setCancelTab] = useState<'message' | 'action' | 'settings'>('message')
  const [displayFees, setDisplayFees] = useState(true)
  const [displayRemaining, setDisplayRemaining] = useState(true)
  const [displayFullCourses, setDisplayFullCourses] = useState(true)
  const [showTopScreen, setShowTopScreen] = useState(true)
  const [showTerms, setShowTerms] = useState(false)
  const [availabilityNotification, setAvailabilityNotification] = useState(false)

  const menuItems: Array<{
    id: MenuItem
    label: string
    icon?: React.ComponentType<{ className?: string }>
    highlighted?: boolean
    indent?: boolean
    isHeader?: boolean
  }> = [
    { id: 'messages', label: 'メッセージ・予約の各種設定', icon: ClockIcon, isHeader: true },
    { id: 'booking-cancel', label: '予約・キャンセルのメッセージ・リクエストと締切', highlighted: true },
    { id: 'reminders', label: '予約前後に送るリマインドメッセージ' },
    { id: 'availability-notification', label: '空き枠通知受け取り設定' },
    { id: 'booking-screen', label: '予約画面', icon: DocumentTextIcon, isHeader: true },
    { id: 'customer-questions', label: 'お客様への質問項目' },
    { id: 'page-display', label: '予約ページの表示設定' },
    { id: 'top-screen', label: 'トップ画面設定' },
    { id: 'business-info', label: '店舗・ビジネス情報' },
    { id: 'terms', label: '利用規約' },
    { id: 'integrations', label: '連携設定', icon: LinkIcon, isHeader: true },
    { id: 'google-sheets', label: 'Googleスプレッドシート連携', indent: true },
    { id: 'other', label: 'その他', icon: DocumentTextIcon, isHeader: true },
    { id: 'delete-system', label: '予約システムの削除', indent: true },
  ]

  const renderMenuContent = () => {
    switch (activeMenu) {
      case 'booking-cancel':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">予約・キャンセルのメッセージ・リクエストと締切</h2>
              <p className="text-sm text-muted-foreground">
                予約確定時とキャンセル時に送信するメッセージを設定できます
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* 予約時 */}
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">予約時</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs value={bookingTab} onValueChange={(v) => setBookingTab(v as any)}>
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="message">メッセージ</TabsTrigger>
                      <TabsTrigger value="action">アクション</TabsTrigger>
                      <TabsTrigger value="settings">各種設定</TabsTrigger>
                    </TabsList>
                    <TabsContent value="message" className="space-y-4 mt-4">
                      <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                        <p>{'{name}'}様</p>
                        <p className="mt-2">予約日時</p>
                        <p>[LESSON_CALENDAR_date_time]</p>
                        <p className="mt-2">コース名</p>
                        <p>[LESSON_CALENDAR_name]</p>
                        <p className="mt-2">ご予約ありがとうございます。</p>
                        <p>当日お待ちしております。</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="action" className="mt-4">
                      <p className="text-sm text-muted-foreground">予約時のアクション設定</p>
                    </TabsContent>
                    <TabsContent value="settings" className="mt-4">
                      <p className="text-sm text-muted-foreground">各種設定</p>
                    </TabsContent>
                  </Tabs>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    予約時の設定をする
                  </Button>
                </CardContent>
              </Card>

              {/* キャンセル時 */}
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                    <CardTitle className="text-lg">キャンセル時</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs value={cancelTab} onValueChange={(v) => setCancelTab(v as any)}>
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="message">メッセージ</TabsTrigger>
                      <TabsTrigger value="action">アクション</TabsTrigger>
                      <TabsTrigger value="settings">各種設定</TabsTrigger>
                    </TabsList>
                    <TabsContent value="message" className="space-y-4 mt-4">
                      <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                        <p>{'{name}'}様</p>
                        <p className="mt-2">予約日時</p>
                        <p>[LESSON_CALENDAR_date_time]</p>
                        <p className="mt-2">コース名</p>
                        <p>[LESSON_CALENDAR_name]</p>
                        <p className="mt-2">キャンセルを受け付けました。</p>
                        <p>またのご利用をお待ちしております。</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="action" className="mt-4">
                      <p className="text-sm text-muted-foreground">キャンセル時のアクション設定</p>
                    </TabsContent>
                    <TabsContent value="settings" className="mt-4">
                      <p className="text-sm text-muted-foreground">各種設定</p>
                    </TabsContent>
                  </Tabs>
                  <Button variant="destructive" className="w-full">
                    キャンセル時の設定をする
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'reminders':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">予約前後に送るリマインドメッセージ</h2>
              <p className="text-sm text-muted-foreground">
                コース開始前後に自動送信されるメッセージを設定できます
              </p>
            </div>

            {/* コース開始前 */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>コース開始前のメッセージ・アクション</span>
                  <Button variant="outline" size="sm">
                    <PlusIcon className="h-4 w-4 mr-1" />
                    送信タイミングを追加する
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary">コース開始 1日前の 10時00分</Badge>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    編集
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* コース終了後 */}
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>コース終了後のメッセージ・アクション</span>
                  <Button variant="outline" size="sm">
                    <PlusIcon className="h-4 w-4 mr-1" />
                    送信タイミングを追加する
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">設定されたタイミングがありません</p>
              </CardContent>
            </Card>
          </div>
        )

      case 'availability-notification':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">空き枠通知受け取り設定</h2>
              <p className="text-sm text-muted-foreground">
                満席時にキャンセルが発生した際の通知設定
              </p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>空き枠通知</CardTitle>
                    <CardDescription>
                      現在: {availabilityNotification ? '受付中' : '停止中'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">変更履歴</Button>
                    <Switch
                      checked={availabilityNotification}
                      onCheckedChange={setAvailabilityNotification}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 text-center">
                      <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">満席・キャンセル発生</p>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 text-center">
                      <BellIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">受付再開メッセージ送信</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  満席状態のコースでキャンセルが発生した場合、自動的に受付再開のメッセージを送信します。
                </p>
              </CardContent>
            </Card>
          </div>
        )

      case 'customer-questions':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">お客様への質問項目</h2>
              <p className="text-sm text-muted-foreground">
                予約時にお客様に入力していただく項目を設定できます
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">質問項目の追加</CardTitle>
                <CardDescription className="text-xs">
                  1. 追加したい項目を選択 → 2. 項目 → 3. 編集
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
                    短文回答
                  </Button>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
                    長文回答
                  </Button>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
                    単一選択
                  </Button>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
                    複数選択
                  </Button>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
                    日時
                  </Button>
                </div>

                <div className="space-y-2 mt-6">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Bars3Icon className="h-4 w-4 text-muted-foreground cursor-move" />
                    <span className="text-sm flex-1">お名前を入力してください</span>
                    <Badge variant="destructive" className="text-xs">必須</Badge>
                    <Button variant="ghost" size="sm">編集</Button>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Bars3Icon className="h-4 w-4 text-muted-foreground cursor-move" />
                    <span className="text-sm flex-1">メールアドレスを入力してください</span>
                    <Badge variant="destructive" className="text-xs">必須</Badge>
                    <Button variant="ghost" size="sm">編集</Button>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Bars3Icon className="h-4 w-4 text-muted-foreground cursor-move" />
                    <span className="text-sm flex-1">電話番号を入力してください</span>
                    <Badge variant="secondary" className="text-xs">任意</Badge>
                    <Button variant="ghost" size="sm">編集</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'page-display':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">予約ページの表示設定</h2>
              <p className="text-sm text-muted-foreground">
                予約ページに表示される情報の設定を行います
              </p>
            </div>

            {/* コース料金の表示 */}
            <Card>
              <CardHeader>
                <CardTitle>コース料金の表示</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={displayFees ? 'show' : 'hide'}
                  onValueChange={(v) => setDisplayFees(v === 'show')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="show" id="fees-show" />
                    <Label htmlFor="fees-show" className="cursor-pointer">表示する</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hide" id="fees-hide" />
                    <Label htmlFor="fees-hide" className="cursor-pointer">表示しない</Label>
                  </div>
                </RadioGroup>
                {displayFees && (
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <p className="text-sm font-medium">プレビュー</p>
                    <div className="mt-2 p-2 bg-white rounded border text-sm">
                      <p>個別相談 - 60分</p>
                      <p className="text-green-600 font-semibold">¥5,000</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 残り枠数の表示 */}
            <Card>
              <CardHeader>
                <CardTitle>残り枠数の表示</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={displayRemaining ? 'show' : 'hide'}
                  onValueChange={(v) => setDisplayRemaining(v === 'show')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="show" id="remaining-show" />
                    <Label htmlFor="remaining-show" className="cursor-pointer">表示する</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hide" id="remaining-hide" />
                    <Label htmlFor="remaining-hide" className="cursor-pointer">表示しない</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* 満席コースの表示 */}
            <Card>
              <CardHeader>
                <CardTitle>満席コースの表示</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={displayFullCourses ? 'show' : 'hide'}
                  onValueChange={(v) => setDisplayFullCourses(v === 'show')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="show" id="full-show" />
                    <Label htmlFor="full-show" className="cursor-pointer">表示する</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hide" id="full-hide" />
                    <Label htmlFor="full-hide" className="cursor-pointer">表示しない</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">プレビュー</Button>
              <Button className="bg-green-600 hover:bg-green-700">保存</Button>
            </div>
          </div>
        )

      case 'top-screen':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">トップ画面設定</h2>
              <p className="text-sm text-muted-foreground">
                予約ページのトップ画面を設定します
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>表示設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={showTopScreen ? 'show' : 'hide'}
                  onValueChange={(v) => setShowTopScreen(v === 'show')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="show" id="top-show" />
                    <Label htmlFor="top-show" className="cursor-pointer">トップ画面を表示する</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hide" id="top-hide" />
                    <Label htmlFor="top-hide" className="cursor-pointer">トップ画面を表示しない</Label>
                  </div>
                </RadioGroup>

                {showTopScreen && (
                  <>
                    <div className="space-y-2">
                      <Label>画像</Label>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <PhotoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-1">
                          画像をドラッグ&ドロップ
                        </p>
                        <p className="text-xs text-muted-foreground">
                          推奨サイズ: 1,000 x 500 px
                        </p>
                        <Button variant="outline" size="sm" className="mt-4">
                          ファイルを選択
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>店舗名</Label>
                      <Input
                        placeholder="例: 無料相談"
                        defaultValue={reservationName}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>説明文</Label>
                      <Textarea
                        placeholder="店舗やサービスの説明を入力してください"
                        rows={6}
                        className="resize-none"
                      />
                      <div className="flex gap-1 pt-2">
                        <Button variant="outline" size="sm">太字</Button>
                        <Button variant="outline" size="sm">斜体</Button>
                        <Button variant="outline" size="sm">リンク</Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline">プレビュー</Button>
              <Button className="bg-green-600 hover:bg-green-700">保存</Button>
            </div>
          </div>
        )

      case 'business-info':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">店舗・ビジネス情報</h2>
              <p className="text-sm text-muted-foreground">
                予約ページに表示される店舗情報を設定します
              </p>
            </div>

            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label>画像</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <PhotoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">画像をアップロード</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      ファイルを選択
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>店舗情報</Label>
                  <Textarea
                    placeholder="店舗の住所、営業時間、アクセス方法などを入力してください"
                    rows={10}
                    className="resize-none"
                  />
                  <div className="flex gap-1 pt-2">
                    <Button variant="outline" size="sm">太字</Button>
                    <Button variant="outline" size="sm">斜体</Button>
                    <Button variant="outline" size="sm">リンク</Button>
                    <Button variant="outline" size="sm">リスト</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline">プレビュー</Button>
              <Button className="bg-green-600 hover:bg-green-700">保存</Button>
            </div>
          </div>
        )

      case 'terms':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">利用規約の設定</h2>
              <p className="text-sm text-muted-foreground">
                予約時に表示する利用規約を設定します
              </p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>利用規約</CardTitle>
                  <Switch checked={showTerms} onCheckedChange={setShowTerms} />
                </div>
                <CardDescription>
                  {showTerms ? '表示する' : '表示しない'}
                </CardDescription>
              </CardHeader>
              {showTerms && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>利用規約の内容</Label>
                    <Textarea
                      placeholder="利用規約の内容を入力してください"
                      rows={12}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            {showTerms && (
              <div className="flex justify-end">
                <Button className="bg-green-600 hover:bg-green-700">保存</Button>
              </div>
            )}
          </div>
        )

      case 'google-sheets':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Googleスプレッドシート連携</h2>
              <p className="text-sm text-muted-foreground">
                予約データをGoogleスプレッドシートに自動で記録します
              </p>
            </div>

            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-yellow-600" />
                  Googleアカウント連携が完了していません
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Googleスプレッドシートとの連携を開始するには、Googleアカウントでログインしてください。
                </p>
                <Button variant="outline" className="w-full">
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 'delete-system':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1 text-red-600">予約システムの削除</h2>
              <p className="text-sm text-muted-foreground">
                この操作は取り消すことができません
              </p>
            </div>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-base text-red-600">危険な操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800 mb-2">
                    この予約システムを削除すると、以下のデータがすべて削除されます：
                  </p>
                  <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
                    <li>すべての予約データ</li>
                    <li>コース設定</li>
                    <li>メッセージ設定</li>
                    <li>顧客情報</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label>確認のため、予約システム名を入力してください</Label>
                  <Input
                    placeholder={reservationName}
                    className="border-red-300 focus:border-red-500"
                  />
                </div>

                <Button variant="destructive" className="w-full">
                  <TrashIcon className="h-4 w-4 mr-2" />
                  予約システムを削除
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  削除の確認メールが送信されます
                </p>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">{menuItems.find(m => m.id === activeMenu)?.label}</h2>
              <p className="text-sm text-muted-foreground">
                この機能は準備中です
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 border-r bg-white">
        <ScrollArea className="h-full">
          <div className="py-3">
            {menuItems.map((item) => {
              const isActive = activeMenu === item.id

              // ヘッダー項目（アイコン付き）は見出しとして表示、クリック不可
              if (item.isHeader) {
                return (
                  <div
                    key={item.id}
                    className="px-4 py-2.5 text-sm font-medium text-gray-900 flex items-center gap-2 bg-gray-50"
                  >
                    {item.icon && (
                      <item.icon className="h-4 w-4 shrink-0 text-gray-600" />
                    )}
                    <span className="flex-1">{item.label}</span>
                  </div>
                )
              }

              // 通常のメニュー項目
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 relative',
                    item.indent && 'pl-8',
                    isActive
                      ? 'text-green-600 font-medium bg-green-50/50'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {/* Green left border for active item */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-600" />
                  )}

                  <span className="flex-1">{item.label}</span>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="p-8">
          {renderMenuContent()}
        </div>
      </div>
    </div>
  )
}
