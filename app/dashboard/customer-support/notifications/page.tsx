'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface NotificationChannel {
  id: string
  name: string
  icon: string
  enabled: boolean
  timing: 'realtime' | 'batched'
  settingsUrl?: string
}

interface NotificationCategory {
  id: string
  name: string
  enabled: boolean
  details: NotificationDetail[]
}

interface NotificationDetail {
  id: string
  label: string
  enabled: boolean
}

export default function NotificationsPage() {
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'mobile',
      name: 'スマートフォンアプリ',
      icon: '📱',
      enabled: true,
      timing: 'realtime',
      settingsUrl: '#',
    },
    {
      id: 'chatwork',
      name: 'ChatWork（チャットワーク）',
      icon: '💬',
      enabled: false,
      timing: 'realtime',
      settingsUrl: '#',
    },
    {
      id: 'desktop',
      name: 'PCデスクトップ',
      icon: '💻',
      enabled: false,
      timing: 'realtime',
      settingsUrl: '#',
    },
  ])

  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: 'chat',
      name: '1:1チャット',
      enabled: true,
      details: [
        { id: 'all', label: '以下の全項目', enabled: false },
        { id: 'normal-message', label: '通常メッセージを受信した時', enabled: true },
        { id: 'auto-response', label: '自動応答キーワードを受信した時', enabled: false },
        { id: 'special-message', label: '【◯◯】メッセージを受信した時', enabled: false },
        { id: 'media', label: 'メディア', enabled: false },
      ],
    },
    {
      id: 'friend-registration',
      name: '友だち登録情報',
      enabled: false,
      details: [],
    },
    {
      id: 'message-delivery',
      name: 'メッセージ配信',
      enabled: false,
      details: [],
    },
    {
      id: 'qr-action',
      name: 'QRコードアクション',
      enabled: false,
      details: [],
    },
    {
      id: 'form-creation',
      name: 'フォーム作成',
      enabled: false,
      details: [],
    },
    {
      id: 'salon-reservation',
      name: 'サロン・面談予約',
      enabled: true,
      details: [],
    },
    {
      id: 'lesson-reservation',
      name: 'レッスン予約',
      enabled: false,
      details: [],
    },
    {
      id: 'event-reservation',
      name: 'イベント予約',
      enabled: false,
      details: [],
    },
    {
      id: 'product-sales',
      name: '商品販売',
      enabled: false,
      details: [],
    },
    {
      id: 'action-schedule',
      name: 'アクションスケジュール実行',
      enabled: false,
      details: [],
    },
    {
      id: 'conversion',
      name: 'コンバージョン',
      enabled: false,
      details: [],
    },
    {
      id: 'asp-management',
      name: 'ASP管理',
      enabled: false,
      details: [],
    },
    {
      id: 'delivery-count-alert',
      name: '配信数アラート',
      enabled: false,
      details: [],
    },
  ])

  const toggleChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === id ? { ...channel, enabled: !channel.enabled } : channel
      )
    )
  }

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id ? { ...category, enabled: !category.enabled } : category
      )
    )
  }

  const toggleDetail = (categoryId: string, detailId: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              details: category.details.map((detail) =>
                detail.id === detailId
                  ? { ...detail, enabled: !detail.enabled }
                  : detail
              ),
            }
          : category
      )
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">通知設定</h2>
        <Button variant="outline">マニュアル</Button>
      </div>

      {/* Step 1: Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>1.通知を受け取る媒体を選択してください</CardTitle>
          <CardDescription>
            ※ チャットワーク・PCデスクトップ通知は、30秒~1分程度通知が遅れる場合があります。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 font-medium text-sm pb-2 border-b">
              <div>通知先</div>
              <div>通知受け取り</div>
              <div>通知タイミング</div>
              <div>各種設定</div>
            </div>

            {channels.map((channel) => (
              <div key={channel.id} className="grid grid-cols-4 gap-4 items-center py-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{channel.icon}</span>
                  <span>{channel.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">OFF</span>
                  <Switch
                    checked={channel.enabled}
                    onCheckedChange={() => toggleChannel(channel.id)}
                  />
                  <span className={channel.enabled ? 'text-green-600 font-medium' : 'text-gray-600'}>
                    ON
                  </span>
                </div>
                <div>
                  <select className="border rounded px-3 py-2 text-sm w-full">
                    <option value="realtime">リアルタイム</option>
                  </select>
                </div>
                <div>
                  {channel.settingsUrl && (
                    <Button variant="outline" size="sm" className="text-blue-600">
                      {channel.id === 'mobile' ? 'ダウンロード' :
                       channel.id === 'chatwork' ? '連携設定' : 'PC設定'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Notification Categories */}
      <Card>
        <CardHeader>
          <CardTitle>2.通知を受け取る項目を選択してください</CardTitle>
          <CardDescription>
            （通知項目は上記の通知先に対して共通設定です）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 font-medium text-sm pb-2 border-b">
              <div>通知項目</div>
              <div>通知受け取り</div>
              <div>通知内容詳細</div>
            </div>

            {categories.map((category) => (
              <div key={category.id} className="border-b last:border-b-0">
                <div className="grid grid-cols-3 gap-4 items-center py-4">
                  <div className={category.enabled ? 'text-green-600 font-medium' : ''}>
                    {category.name}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">OFF</span>
                    <Switch
                      checked={category.enabled}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <span className={category.enabled ? 'text-green-600 font-medium' : 'text-gray-600'}>
                      ON
                    </span>
                  </div>
                  <div>
                    {category.details.length > 0 && category.enabled && (
                      <div className="space-y-2">
                        {category.details.map((detail) => (
                          <div key={detail.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${category.id}-${detail.id}`}
                              checked={detail.enabled}
                              onCheckedChange={() => toggleDetail(category.id, detail.id)}
                            />
                            <Label
                              htmlFor={`${category.id}-${detail.id}`}
                              className={detail.enabled ? 'text-green-600 font-medium' : 'font-normal'}
                            >
                              {detail.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
