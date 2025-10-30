'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  ClockIcon,
  Squares2X2Icon,
  DocumentTextIcon,
  TagIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline'
import QRCode from 'react-qr-code'

type GreetingType = 'new' | 'existing' | 'unblock'

interface Action {
  id: string
  type: 'template' | 'tag'
  name: string
  filter: string
  action: string
}

export default function GreetingMessagePage() {
  const [activeTab, setActiveTab] = useState<GreetingType>('new')
  const [message, setMessage] = useState('')
  const [actions, setActions] = useState<Action[]>([
    {
      id: '1',
      type: 'template',
      name: '初期アンケート_開始',
      filter: '絞り込みなし',
      action: 'を送信',
    },
    {
      id: '2',
      type: 'tag',
      name: '非購入アカウント',
      filter: '絞り込みなし',
      action: 'をつける',
    },
    {
      id: '3',
      type: 'tag',
      name: '診断未回答',
      filter: '絞り込みなし',
      action: 'をつける',
    },
  ])

  const friendAddUrl = 'https://line.me/R/ti/p/%400508bxanx'

  const tabConfig = {
    new: {
      label: '新規友だち用',
      color: 'bg-green-600',
      description: '新規友だち',
      note: null,
    },
    existing: {
      label: '既存友だち用',
      color: 'bg-blue-600',
      description: '既存友だち',
      note: '認証済みアカウントを接続した時に、自動で取得される既存の友だちにはアクションは稼働しません。',
    },
    unblock: {
      label: 'ブロック解除友だち用',
      color: 'bg-orange-500',
      description: '友だちのブロック解除時のみ',
      note: null,
    },
  }

  const currentConfig = tabConfig[activeTab]

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">あいさつメッセージ設定</h2>
        <a href="#" className="text-sm text-blue-600 hover:underline">
          友だちの流入経路を分析したい場合はこちら
        </a>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'new' ? 'default' : 'outline'}
          onClick={() => setActiveTab('new')}
          className={activeTab === 'new' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          新規友だち用
        </Button>
        <Button
          variant={activeTab === 'existing' ? 'default' : 'outline'}
          onClick={() => setActiveTab('existing')}
          className={activeTab === 'existing' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          既存友だち用
        </Button>
        <Button
          variant={activeTab === 'unblock' ? 'default' : 'outline'}
          onClick={() => setActiveTab('unblock')}
          className={activeTab === 'unblock' ? 'bg-orange-500 hover:bg-orange-600' : ''}
        >
          ブロック解除友だち用
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0">
            <div className="w-10 h-10 bg-green-500 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm text-gray-700">
              このページで設定したメッセージ・アクションは{' '}
              <span className="font-medium text-blue-600">{currentConfig.description}</span>{' '}
              のみ稼働します。
            </p>
            {currentConfig.note && (
              <p className="text-sm text-gray-700 mt-1">{currentConfig.note}</p>
            )}
          </div>
        </div>
      </div>

      {/* Friend Add URL - Only for New Friends */}
      {activeTab === 'new' && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">友だち追加URL</h3>
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={friendAddUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(friendAddUrl)}
                  >
                    <DocumentTextIcon className="h-4 w-4" />
                  </Button>
                </div>
                <a href="#" className="text-xs text-blue-600 hover:underline">
                  LINE公式アカウントの友だち追加URLとの違い
                </a>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white p-3 rounded-lg border">
                  <QRCode value={friendAddUrl} size={120} />
                </div>
                <Button variant="outline" size="sm">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
            メッセージ・アクション設定
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            テスト方法
          </button>
        </div>
      </div>

      {/* Message Section */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-medium">
            {activeTab === 'new' && '新規友だち追加時メッセージ・アクション設定'}
            {activeTab === 'existing' && '既存友だちに対するメッセージ・アクション設定'}
            {activeTab === 'unblock' && 'ブロック解除時のメッセージ・アクション設定'}
          </h3>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">送信するメッセージを登録</h4>
            <div className="flex gap-2 mb-2">
              <Button variant="outline" size="sm">
                <span className="mr-1">＋</span> LINE名
              </Button>
              <Button variant="outline" size="sm">
                <span className="mr-1">＋</span> 友だち情報
              </Button>
            </div>
            <Textarea
              placeholder="メッセージを入力してください"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <div className="text-right text-sm text-gray-500">{message.length}/5,000</div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Section */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">上記メッセージ送信以外のアクション登録</h4>
            <p className="text-sm text-gray-600 mb-4">
              友だち追加時の<span className="text-green-600">ステップ配信の開始</span>や
              <span className="text-green-600">リッチメニュー表示</span>
              などのアクションをこちらで設定します。
            </p>

            {/* Action Icons */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <ClockIcon className="h-10 w-10" />
                <div className="text-xs text-center">
                  ステップ配信を
                  <br />
                  開始・停止する
                </div>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <Squares2X2Icon className="h-10 w-10" />
                <div className="text-xs text-center">
                  リッチメニューを
                  <br />
                  表示する
                </div>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <DocumentTextIcon className="h-10 w-10" />
                <div className="text-xs text-center">
                  テンプレートを
                  <br />
                  送信する
                </div>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <TagIcon className="h-10 w-10" />
                <div className="text-xs text-center">
                  タグを
                  <br />
                  付け・外しする
                </div>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <EllipsisHorizontalIcon className="h-10 w-10" />
                <div className="text-xs text-center">
                  その他の
                  <br />
                  アクションをみる
                </div>
              </button>
            </div>

            <Button className="bg-blue-500 hover:bg-blue-600 text-white mb-4">
              アクション追加・編集
            </Button>

            {/* Action List */}
            <div className="space-y-2">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{action.type === 'template' ? 'テンプレート' : 'タグ'}</span>
                    <span className="text-sm">{action.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{action.filter}</span>
                    <span className="text-sm">{action.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8">
        保存
      </Button>
    </div>
  )
}
